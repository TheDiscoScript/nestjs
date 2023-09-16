import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { LoggerService } from '@nx-useful-implementations/logger';
//import { MongoDbHealthIndicator } from './health-indicator.service';

export const MONGODB_CONNECTION = 'mongo_db_connection';
export const DB_CONNECTION = 'db_connection';
@Global()
@Module({
	providers: [
		{
			provide: MONGODB_CONNECTION,
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				const logger = new LoggerService('DatabaseModule', { timestamp: true });

				const appName = 'DbConnection';
				const host = configService.get('db.host');
				const port = configService.get('db.port');
				const authDb = configService.get('db.authDb');
				const user = configService.get('db.user');
				const password = configService.get('db.pass');
				const mongoUri = configService.get('db.uri');

				let uri = `mongodb://${user}:${password}@${host}:${port}/${authDb}`;

				if (!user || !String(user).length) {
					uri = `mongodb://${host}:${port}/${authDb}`;
				}
				if (mongoUri) {
					uri = mongoUri;
				}

				try {
					logger.v(`Connecting to MongoDB at ${uri}`, appName);
					const client = await MongoClient.connect(uri, {
						socketTimeoutMS: 30000,
					});
					logger.log(`Connected to MongoDB`, appName);
					return client;
				} catch (err) {
					logger.error(`Error connecting to MongoDB at ${uri} (${(err as Error).message})`, { error: err }, appName);
					process.exit();
				}
			},
		},
		{
			provide: DB_CONNECTION,
			inject: [ConfigService, MONGODB_CONNECTION],
			useFactory: async (configService: ConfigService, client: MongoClient) => {
				const logger = new LoggerService('DatabaseModule', { timestamp: true });

				const appName = 'DbConnection';
				const mongoUri = configService.get('db.uri');

				let dbName = configService.get('db.dbName');
				if (mongoUri && !dbName) {
					dbName = getDbName(mongoUri);
				}

				try {
					logger.v(`Creating MongoDB client on ${dbName} `, appName);
					return client.db(dbName);
				} catch (err) {
					logger.error(`Error connection to MongoDb db ${dbName} (${(err as Error).message})`, { error: err }, appName);
					process.exit();
				}
			},
		},
	],
	exports: [DB_CONNECTION],
})
export class DatabaseConnectionModule implements OnApplicationShutdown {
	logger = new LoggerService('DatabaseModule', { timestamp: false });

	constructor(@Inject(MONGODB_CONNECTION) protected readonly client: MongoClient) {}

	// Close connection on shutdown
	async onApplicationShutdown() {
		if (this.client) {
			this.logger.v(`Closing MongoDb connection`);
			await this.client.close();
			this.logger.l(`Successfully closed a MongoDb connection`);
		}
	}
}

const getDbName = (uri: string): string => {
	const dbNameWithParams = uri.split('/')[3];
	if (!dbNameWithParams || dbNameWithParams?.lastIndexOf('?') === -1) return dbNameWithParams;

	const indexOfParams = dbNameWithParams.lastIndexOf('?');
	const dbNameWithoutParams = dbNameWithParams.slice(0, indexOfParams);

	return dbNameWithoutParams;
};
