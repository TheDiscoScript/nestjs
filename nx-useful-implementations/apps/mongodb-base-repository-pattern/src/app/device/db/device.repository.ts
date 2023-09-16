import { Inject, Injectable } from '@nestjs/common';
import { EntityInterface } from '@nx-useful-implementations/common';
import { BaseRepository, DB_CONNECTION } from '@nx-useful-implementations/mongodb';
import { DeviceEntity } from './device.entity';
import { Db } from 'mongodb';

@Injectable()
export class DeviceRepository extends BaseRepository<DeviceEntity> {
	constructor(@Inject(DB_CONNECTION) protected readonly dbConnection: Db) {
		super(dbConnection);
	}

	instantiateEntity(doc: EntityInterface<DeviceEntity>): DeviceEntity {
		return new DeviceEntity(doc);
	}

	getCollectionName() {
		return 'devices';
	}
}
