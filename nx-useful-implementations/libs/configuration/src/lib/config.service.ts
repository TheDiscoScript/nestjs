import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsEnum, validateSync } from 'class-validator';
import { ConfigType, ConfigService as NestConfigService } from '@nestjs/config';
import { registerAs } from '@nestjs/config';

/**
 This is work in progress, but the idea is to have a class that can be injected in the whole app and can be used to get the config values.
 Preferably, this class should be used in the constructor of the services, so that the config values are injected in the service.
 And It should be in libs, so that it can be used in multiple apps.
 I am currently looking for solution of injecting multiple config files in the app
    And having type safety for the config values
 */
export const AGGREGATE_CONFIG_TOKEN = 'AGGREGATE_CONFIG_TOKEN';

enum NodeEnv {
	LOCAL = 'local',
	TEST = 'test',
	PROD = 'prod',
}
class EnvSchema {
	@IsEnum(NodeEnv)
	readonly NODE_ENV: NodeEnv = NodeEnv.LOCAL;
}

export const LibConfig = registerAs('TestConfig', () =>
	Object.freeze({
		docs: {
			title: 'Test lib title',
			description: 'Test lib description',
			version: '1.0',
		},
	} as const),
);

@Injectable()
export class ConfigService {
	constructor(
		private readonly nestConfigService: NestConfigService<EnvSchema, true>,

		//@Inject(AGGREGATE_CONFIG_TOKEN) private readonly aggregateConfig:any,
		@Inject(LibConfig.KEY) private readonly _appConfig: ConfigType<typeof LibConfig>,
	) {}

	static validateEnvs(envs: Record<string, unknown>) {
		// Maybe validate with zod
		const validatedConfig = plainToInstance(EnvSchema, envs);
		const errors = validateSync(validatedConfig);
		if (errors.length > 0) {
			throw new Error(errors.toString());
		}
		return validatedConfig;
	}

	public getEnv<EnvName extends keyof EnvSchema>(envName: EnvName) {
		return this.nestConfigService.get(envName, { infer: true });
	}

	public isLocalEnv() {
		return this.getEnv('NODE_ENV') === NodeEnv.LOCAL;
	}

	get appConfig() {
		return this._appConfig;
	}
}
