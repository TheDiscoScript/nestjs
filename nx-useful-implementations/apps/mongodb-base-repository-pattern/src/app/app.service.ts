import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@nx-useful-implementations/logger';

@Injectable()
export class AppService implements OnModuleInit {
	private readonly logger = new LoggerService(this.constructor.name);

	onModuleInit() {
		console.log('--------------------------------------------------------------------------------------------');
		console.log('--------------------------------------------------------------------------------------------');
		this.logger.log('default log - AppService initialized');
		this.logger.l('l - AppService initialized');
		this.logger.lForce('lForce - AppService initialized');
		this.logger.d('d - AppService initialized');
		this.logger.w('w - AppService initialized');
		this.logger.e(new Error('e - AppService initialized - Test Error'));
		console.log('--------------------------------------------------------------------------------------------');
		console.log('--------------------------------------------------------------------------------------------');
	}

	helloWorld() {
		//this.logger.l('Hello API');
		return { message: 'Hello API' };
	}
}
