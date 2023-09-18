import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@nx-useful-implementations/logger';
import { DeviceRepository } from './db/device.repository';
import { DeviceEntity, DeviceUser } from './db/device.entity';
import { EntityInterface } from '@nx-useful-implementations/common';

@Injectable()
export class DeviceService implements OnModuleInit {
	private readonly logger = new LoggerService(this.constructor.name);

	constructor(private readonly repo: DeviceRepository) {}

	async onModuleInit() {
		try {
			const { results, errors, error } = await this.repo.find({});
			if (error) {
				this.logger.e(error);
				return;
			}
			if (errors.length > 0) {
				this.logger.e(new Error(errors.join('\n')));
			}
			if (results.length > 0) return;

			console.log('Am i here?');
			const Users = [
				new DeviceEntity({
					model: 'model',
					serialNumber: 123,
					tsCreated: Date.now(),
					user: new DeviceUser({
						firstName: 'John',
						lastName: 'Doe',
						email: '+ěš',
					}),
				}),
				new DeviceEntity({
					model: 'model_1',
					serialNumber: 456,
					tsCreated: Date.now(),
					user: new DeviceUser({
						firstName: 'John',
						lastName: 'Doe',
						email: '+ěš@š+ěšě+.com',
					}),
				}),
			];
			const { error: insertErr, result } = await this.repo.insertMany(Users);
			if (insertErr) this.logger.e(insertErr);
			if (result) this.logger.l('Successfuly inserted default users.');
		} catch (e) {
			this.logger.e(e as Error);
		}
	}

	async getDevices() {
		const { results, errors, error } = await this.repo.find({});
		if (error) {
			this.logger.e(error);
			return;
		}
		if (errors) {
			this.logger.e(new Error(errors.join('\n')));
		}
		return results;
	}

	async createDevice(input: EntityInterface<DeviceEntity>) {
		const { error, result } = await this.repo.insertOne(input);
		if (error) {
			this.logger.e(error);
			return;
		}
		return result;
	}

	async deleteDevice(id: number) {
		const { error, result } = await this.repo.deleteOne({ serialNumber: id });
		if (error) {
			this.logger.e(error);
			return;
		}
		return result;
	}

	async updateDevice(monter: string, userName: string) {
		const { error, result } = await this.repo.updateOne({ model: monter }, { $set: { 'user.firstName': userName } });
		if (error) {
			this.logger.e(error);
			return;
		}
		return result;
	}
}
