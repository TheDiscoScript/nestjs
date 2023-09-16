import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '@nx-useful-implementations/logger';
import { ConfigModule } from '@nestjs/config';
import { getBaseConfiguration } from '@nx-useful-implementations/configuration';
import { DatabaseConnectionModule } from '@nx-useful-implementations/mongodb';
import { DeviceModule } from './device/device.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [getConfig],
		}),
		//db
		DatabaseConnectionModule,
		//util
		LoggerModule,
		//logic
		DeviceModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

function getConfig() {
	const { MONGODB_URI } = process.env;

	const baseConfig = getBaseConfiguration();
	return {
		...baseConfig,
		app: {
			...baseConfig.app,
			name: 'mongodb-base-repository-pattern',
		},
		db: {
			uri: MONGODB_URI,
		},
	};
}
