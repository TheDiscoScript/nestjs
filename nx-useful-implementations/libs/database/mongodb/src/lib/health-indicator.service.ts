import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { Db } from 'mongodb';
import { DB_CONNECTION } from './database-connection.module';

@Injectable()
export class MongoDbHealthIndicator extends HealthIndicator {
	constructor(@Inject(DB_CONNECTION) private readonly dbConnection: Db) {
		super();
	}

	async pingCheck(): Promise<HealthIndicatorResult> {
		try {
			await this.dbConnection.command({ ping: 1 });

			return {
				database: {
					status: 'up',
				},
			};
		} catch (err) {
			throw new HealthCheckError('Mongo ping failed', { database: { status: 'down', message: (err as Error).message } });
		}
	}
}
