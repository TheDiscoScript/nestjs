import { Body, Controller, Delete, Get, Post, Put, Query } from '@nestjs/common';
import { LoggerService } from '@nx-useful-implementations/logger';
import { DeviceService } from './device.service';
import { EntityInterface } from '@nx-useful-implementations/common';
import { DeviceEntity } from './db/device.entity';

@Controller('device')
export class DeviceController {
	private readonly logger = new LoggerService(this.constructor.name);

	constructor(private readonly service: DeviceService) {}

	@Get()
	async getDevices() {
		return await this.service.getDevices();
	}

	@Post()
	async createDevice(@Body() body: EntityInterface<DeviceEntity>) {
		return await this.service.createDevice(body);
	}

	@Delete()
	async deleteDevice(@Body() body: { serial: number }) {
		return await this.service.deleteDevice(body.serial);
	}

	@Put()
	async updateDevice(@Query() query: { model: string; userName: string }) {
		return await this.service.updateDevice(query.model, query.userName);
	}
}
