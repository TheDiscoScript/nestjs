import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeviceRepository } from './db/device.repository';

@Module({
	imports: [],
	controllers: [DeviceController],
	providers: [DeviceService, DeviceRepository],
})
export class DeviceModule {}
