import { Injectable, Scope, ConsoleLogger } from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';
import { configureScope, captureException } from '@sentry/node';
import { Scope as SentryScope } from '@sentry/types';
//who doesnt love colourful logs
import chalk from 'chalk';
import { getBaseConfiguration } from '@nx-useful-implementations/configuration';

interface SentryExtras {
	sentryNote?: string;
	reqId?: string;
	additionalData?: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
	private config = getBaseConfiguration();
	private hasSentry = false;

	constructor(context?: string, options?: ConsoleLoggerOptions) {
		let newOptions = options as ConsoleLoggerOptions;
		const config = getBaseConfiguration();
		context = context ?? '';

		if (!newOptions?.logLevels) {
			if (!newOptions) {
				newOptions = {};
			}
			newOptions.logLevels =
				config.app.isProduction && !config.app.isDebugMode
					? ['error', 'warn', 'debug']
					: !config.app.isDebugMode
					? ['log', 'error', 'verbose', 'warn', 'debug']
					: ['log', 'error', 'verbose', 'warn', 'debug'];
		}
		super(context, newOptions);
		this.hasSentry = Boolean(config?.app?.sentryDsn?.length);
	}

	//log
	l(message: any, method?: string) {
		if (!this.isLevelEnabled('log')) {
			return;
		}
		let text = `${chalk.green(String(message))}`;
		if (method) {
			text = `\x1B[33m[${method}]\x1B[39m ${text}`;
		}
		super.log(text, this.context);
	}

	//force console.log()
	lForce(message: any, method?: string) {
		let text = `${chalk.green(String(message))}`;
		if (method) {
			text = `\x1B[33m[${method}]\x1B[39m ${text}`;
		}
		console.log(text);
	}

	//debug
	d(message: any, method?: string, data?: any) {
		if (!this.isLevelEnabled('debug')) {
			return;
		}
		let text = `${chalk.blue(String(message))}`;
		if (method) {
			text = `\x1B[33m[${method}]\x1B[39m ${text}`;
		}
		super.debug(text, this.context);
		if (data) {
			super.debug(data, this.context);
		}
	}

	w(message: any, method?: string) {
		if (!this.isLevelEnabled('warn')) {
			return;
		}
		let text = `${chalk.yellow(String(message))}`;
		if (method) {
			text = `\x1B[33m[${method}]\x1B[39m ${text}`;
		}
		super.warn(text, this.context);
	}

	v(message: any, method?: string) {
		if (!this.isLevelEnabled('verbose')) {
			return;
		}
		let text = `${chalk.magenta(String(message))}`;
		if (method) {
			text = `\x1B[33m[${method}]\x1B[39m ${text}`;
		}
		super.verbose(text, this.context);
	}

	e(error: Error | string, method?: string, sentryExtras?: SentryExtras) {
		if (!this.isLevelEnabled('error')) {
			return;
		}
		let text;

		if (error instanceof Error) {
			text = `${chalk.red(String(error.message))}`;
			if (this.hasSentry) this.sendErrorToSentry(error, method, sentryExtras);
			return super.error(text, error?.stack, this.context);
		}

		text = `${chalk.green(String(error))}`;
		if (method) {
			text = `\x1B[33m[${method}]\x1B[39m ${text}`;
		}

		if (this.hasSentry) this.sendErrorToSentry(Error(error), method, sentryExtras);
		return super.error(text, this.context);
	}

	private sendErrorToSentry(error: Error, method?: string, s?: SentryExtras) {
		configureScope((scope: SentryScope) => {
			scope.setTag('category', this.context);
			scope.setTag('version', this.config.app.systemInfo.version);
			if (method) scope.setTag('method', method);
			if (s?.sentryNote) scope.setExtra('note', s.sentryNote);
			if (s?.reqId) scope.setExtra('reqId', s.reqId);
			if (s?.additionalData) scope.setExtra('additionalData', s.additionalData);

			captureException(error);
		});
	}
}
