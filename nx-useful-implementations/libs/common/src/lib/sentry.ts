import { getBaseConfiguration } from '@nx-useful-implementations/configuration';
import * as Sentry from '@sentry/node';

export const initSentry = (appName: string) => {
	const baseConfig = getBaseConfiguration();
	Sentry.init({
		dsn: baseConfig?.app?.sentryDsn,
		serverName: appName,
	});
};

const sentryUnhandledRejection = (reason: any) => {
	Sentry.configureScope((scope) => {
		scope.setTag('category', 'unhandledRejection');
		Sentry.captureException(reason);
	});
};
const sentryUncaughtException = (error: Error) => {
	Sentry.configureScope((scope) => {
		scope.setTag('category', 'uncaughtException');
		Sentry.captureException(error);
	});
};
const sentryProcessExit = (code: number) => {
	Sentry.configureScope((scope) => {
		scope.setTag('category', 'processExit');
		Sentry.captureMessage(`Process exit with code ${code}`);
	});
};
export const registerProcessHandlersForSentry = () => {
	process.on('unhandledRejection', sentryUnhandledRejection);
	process.on('uncaughtException', sentryUncaughtException);
	process.on('exit', sentryProcessExit);
};
