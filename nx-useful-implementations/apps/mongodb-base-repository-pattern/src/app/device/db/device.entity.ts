import { EntityInterface } from '@nx-useful-implementations/common';
import { BaseEntity } from '@nx-useful-implementations/mongodb';

export class DeviceUser {
	firstName!: string;
	lastName!: string;
	email!: string;

	constructor(fields: Omit<EntityInterface<DeviceUser>, '_id'>) {
		Object.assign(this, fields);
	}

	getName() {
		return `${this.firstName} ${this.lastName}`;
	}

	setName(name: `${string} ${string}`) {
		const [firstName, lastName] = name.split(' ');
		this.firstName = firstName;
		this.lastName = lastName;
	}
}

export class DeviceEntity extends BaseEntity {
	model!: string;
	serialNumber!: number;
	tsCreated!: number;
	user?: DeviceUser;

	constructor(fields: Omit<EntityInterface<DeviceEntity>, '_id'>) {
		super();
		Object.assign(this, fields);
	}

	getUsername() {
		return this.user?.getName();
	}
}
