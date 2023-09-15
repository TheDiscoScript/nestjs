import { Injectable } from '@nestjs/common';
import { BaseRepository, BaseTimeseriesRepository } from '../base.repository';
import { DataDetails, DataTimeseries, DeviceEntity } from './entity';
import { EntityInterface } from '@nx-useful-implementations/common';

@Injectable()
export class DeviceRepository extends BaseRepository<DeviceEntity> {
	instantiateEntity(doc: EntityInterface<DeviceEntity>): DeviceEntity {
		return new DeviceEntity(doc);
	}

	getCollectionName() {
		return 'devices';
	}
}

@Injectable()
export class DataRepository extends BaseTimeseriesRepository<DataDetails, DataTimeseries> {
	getCollectionName() {
		return 'data';
	}
}
