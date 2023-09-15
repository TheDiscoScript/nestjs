import { ObjectId } from 'mongodb';
import { EntityInterface } from '@nx-useful-implementations/common';

export abstract class BaseEntity {
	_id!: ObjectId;

	getId() {
		return this._id.toString();
	}
}

export class BaseTimeseriesEntity<X> {
	value!: number;
	date!: Date;
	metadata!: X;

	constructor(fields: EntityInterface<BaseTimeseriesEntity<X>>) {
		Object.assign(this, fields);
	}

	getValue() {
		return this.value;
	}
	getDate() {
		return this.date;
	}
	getMetadata() {
		return this.metadata;
	}
}
