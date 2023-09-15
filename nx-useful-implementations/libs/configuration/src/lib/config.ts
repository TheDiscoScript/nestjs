// I am currently working on better implementation.
// For time beeing I will be using this.

export function getBaseConfiguration() {
	const { SHOW_DEBUG, IS_PRODUCTION, ENABLE_LOCAL_LOGGER, SENTRY_DNS, NODE_ENV } = process.env;
	return {
		app: {
			name: 'base-configuration',
			isProduction: String(IS_PRODUCTION)?.toLowerCase() === 'true',
			enableLocalLogger: String(ENABLE_LOCAL_LOGGER)?.toLowerCase() === 'true',
			isDebugMode: String(SHOW_DEBUG)?.toLowerCase() == 'true',
			sentryDsn: SENTRY_DNS ?? '',
			nodeEnv: NODE_ENV || 'development',
			systemInfo: {
				osArchitecture: process.arch,
				osPlatform: process.platform,
				processPid: process.pid,
				version: process.version,
				title: process.title,
			},
		},
	};
}

export function getSpecifiedConfigExample() {
	const { SPECIFIEDENV } = process.env;

	const baseConfig = getBaseConfiguration();
	return {
		...baseConfig,
		app: {
			...baseConfig.app,
			name: 'specifiedconfigExample',
		},
	};
}
