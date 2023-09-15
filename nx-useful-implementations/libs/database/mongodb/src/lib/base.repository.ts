import {
	Db,
	Collection,
	Filter,
	FindOptions,
	InsertOneOptions,
	BulkWriteOptions,
	DeleteOptions,
	AnyBulkWriteOperation,
	Document,
	UpdateFilter,
	CreateCollectionOptions,
	IndexSpecification,
	CreateIndexesOptions,
	MongoError,
	SortDirection,
	AggregateOptions,
	OptionalUnlessRequiredId,
} from 'mongodb';
import { BaseEntity, BaseTimeseriesEntity } from './base.entity';
import { EntityInterface } from '@nx-useful-implementations/common';
import { Inject, OnModuleInit } from '@nestjs/common';
import { DB_CONNECTION } from './database-connection.module';

type SortDefinition = { sort?: string; direction?: SortDirection };
type IndexToCreate = {
	name: string;
	indexSpec: IndexSpecification;
	options?: CreateIndexesOptions;
};
export interface CustomCreateCollectionOptions extends CreateCollectionOptions {
	baseProjection?: Document;
	indexes?: IndexToCreate[];
}
/**
 We could do one level of abstraction more because of the commonalities between BaseRepository and BaseTimeseriesRepository
 Mainly getCollectionName() and instantiateEntity() are the same
 And Database Methods could be abstracted as well
 */

export abstract class BaseRepository<Entity extends BaseEntity, IEntity extends Document = EntityInterface<Entity>> implements OnModuleInit {
	private readonly collection!: Collection<IEntity>;
	private readonly baseProjection?: Document = { _id: -1 };
	private readonly indexes: IndexToCreate[] = [];

	abstract getCollectionName(): string;
	abstract instantiateEntity(doc: IEntity): Entity;

	constructor(@Inject(DB_CONNECTION) protected readonly dbConnection: Db, options?: CustomCreateCollectionOptions) {
		this.collection = dbConnection.collection(this.getCollectionName());
		if (options?.baseProjection) {
			this.baseProjection = options.baseProjection;
		}
		if (options?.indexes) {
			this.indexes = options.indexes;
		}
	}

	async onModuleInit() {
		await this.initCollection();
		await this.createIndexes();
	}

	/** 
    Read rights
    */
	//I dont like this solution of find, but will leave it for now
	async find(query: Filter<IEntity>, options?: FindOptions<IEntity>) {
		try {
			const docs = (await this.collection.find(query, options).toArray()) as IEntity[];
			// Attempt to instantiate each document and collect results or errors
			const resultsOrErrors = docs.map((d) => {
				try {
					return { result: this.instantiateEntity(d) };
				} catch (error) {
					return { error: error as Error, problematicDoc: d };
				}
			});

			// Separate out successful results from errors
			const successfulResults = resultsOrErrors.filter((r) => 'result' in r).map((r) => r.result);
			const instantiationErrors = resultsOrErrors.filter((r) => 'error' in r).map((r) => ({ error: r.error, doc: r.problematicDoc }));

			return {
				results: successfulResults,
				errors: instantiationErrors,
			};
		} catch (e) {
			return { error: e as Error };
		}
	}

	//findPagination
	async findPaging(
		query: Filter<IEntity>,
		lazyOptions: {
			limit: number | 100;
			page: number | undefined;
			sort: { sort: string; direction?: SortDirection };
			options?: FindOptions<IEntity>;
		},
	) {
		try {
			const docs = (await this.findPagination(query, lazyOptions.limit, lazyOptions.page, lazyOptions.sort, lazyOptions.options)) as IEntity[];
			const resultsOrErrors = docs.map((d) => {
				try {
					return { result: this.instantiateEntity(d) };
				} catch (error) {
					return { error: error as Error, problematicDoc: d };
				}
			});

			// Separate out successful results from errors
			const successfulResults = resultsOrErrors.filter((r) => 'result' in r).map((r) => r.result);
			const instantiationErrors = resultsOrErrors.filter((r) => 'error' in r).map((r) => ({ error: r.error, doc: r.problematicDoc }));

			return {
				results: successfulResults,
				errors: instantiationErrors,
			};
		} catch (e) {
			return { error: e as Error };
		}
	}

	async findOne(query: Filter<IEntity>, options?: FindOptions<IEntity>) {
		try {
			const doc = await this.collection.findOne(query, options);
			return { result: doc ? this.instantiateEntity(doc) : null };
		} catch (e) {
			return { error: e as Error };
		}
	}

	/** 
    Write rights
     */
	async insertMany(entities: OptionalUnlessRequiredId<IEntity>[], options?: InsertOneOptions) {
		try {
			const isIndexesOk = await this.ensureIndexes();
			if (!isIndexesOk) throw new Error('Not all indexes are created');

			const res = await this.collection.insertMany(entities, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async insertOne(entity: OptionalUnlessRequiredId<IEntity>, options?: InsertOneOptions) {
		try {
			const isIndexesOk = await this.ensureIndexes();
			if (!isIndexesOk) throw new Error('Not all indexes are created');

			const res = await this.collection.insertOne(entity, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async updateMany(query: Filter<IEntity>, update: UpdateFilter<IEntity>, options?: FindOptions<IEntity>) {
		try {
			const res = await this.collection.updateMany(query, update, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async updateOne(query: Filter<IEntity>, update: UpdateFilter<IEntity>, options?: FindOptions<IEntity>) {
		try {
			const res = await this.collection.updateOne(query, update, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async deleteMany(query: Filter<IEntity>, options?: DeleteOptions) {
		try {
			const res = await this.collection.deleteMany(query, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async deleteOne(query: Filter<IEntity>, options?: DeleteOptions) {
		try {
			const res = await this.collection.deleteOne(query, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	/** 
    Rarely used
    */
	async insertOneOrReplace(query: Filter<IEntity>, entity: OptionalUnlessRequiredId<IEntity>, options?: InsertOneOptions) {
		try {
			const res = await this.collection.findOneAndReplace(query, entity, { ...options, upsert: true });
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async bulkWrite(operations: AnyBulkWriteOperation<IEntity>[], options?: BulkWriteOptions) {
		try {
			const res = await this.collection.bulkWrite(operations, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async count(query: Filter<IEntity>, options?: FindOptions<IEntity>) {
		try {
			const num = await this.collection.countDocuments(query, options);
			return { result: num };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async aggregate(pipeline: IEntity[], options?: AggregateOptions) {
		try {
			const docs = await this.collection.aggregate(pipeline, options).toArray();
			return { result: docs };
		} catch (e) {
			return { error: e as Error };
		}
	}

	////////////////////////////////////////////////////////////////
	///////////////////     PRIVATE - bit annoying      ////////////
	////////////////////////////////////////////////////////////////
	private async getHeaderInfo(
		query: Filter<IEntity>,
		limit: number,
		page: number,
		sort?: SortDefinition | SortDefinition[],
		options?: FindOptions<IEntity>,
	) {
		options === undefined
			? (options = { projection: this.baseProjection })
			: (options['projection'] = options?.projection || this.baseProjection);

		const allDocumentsCnt = await this.collection.countDocuments(query, options);
		const pages = limit ? Math.fround(allDocumentsCnt / limit) : allDocumentsCnt;
		const result = {
			totalPages: pages < 1 ? 1 : pages,
			totalCount: allDocumentsCnt,
			pageSize: limit,
			pageIndex: limit ? page : undefined,
		};
		if (Array.isArray(sort)) {
			return {
				...result,
				sort: sort
					.map((s) => {
						if (!s.sort || s.sort == '_id') {
							return undefined;
						}
						return {
							sort: s.sort,
							direction: s.direction ?? 'desc',
						};
					})
					.filter((i) => !!i),
			};
		}
		return {
			...result,
			sortBy: sort?.sort,
			sortDirection: sort?.sort ? sort?.direction ?? 'desc' : undefined,
		};
	}

	private async findPagination(
		query: Filter<IEntity>,
		limit: number | 100,
		page: number | undefined,
		sort: { sort: string; direction?: SortDirection },
		options?: FindOptions<IEntity>,
	) {
		let find = this.collection.find(query, options);
		if (page != undefined) {
			find = find.skip(limit * (page - 1));
		}
		if (limit != undefined) {
			find = find.limit(limit);
		}
		return find.sort(sort.sort, sort.direction).toArray();
	}

	private async initCollection() {
		const listOfCollections = new Set((await this.dbConnection.collections())?.map((c) => c.collectionName));
		if (listOfCollections.has(this.getCollectionName())) return;
		return this.dbConnection.createCollection(this.getCollectionName());
	}
	private async createIndexes() {
		if (!this.indexes?.length) {
			return;
		}
		try {
			const toCreate = this.indexes.map((def) =>
				this.createIndexIfNotExists(def.name, def.indexSpec, {
					background: true,
					...def.options,
				}),
			);
			await Promise.all(toCreate);
		} catch (errorCreateIndex) {
			// todo log
			console.log(errorCreateIndex);
		}
	}
	private async createIndexIfNotExists(name: string, indexSpec: IndexSpecification, options?: CreateIndexesOptions) {
		// Check if an index with the same definition and options already exists
		const existingIndexes = await this.collection.listIndexes().toArray();
		const existingIndex = existingIndexes.find((index) => JSON.stringify(index.key) === JSON.stringify(indexSpec) && index.name === name);
		if (existingIndex) {
			return;
		}

		// Drop the existing index (if it exists)
		try {
			await this.collection.dropIndex(name);
		} catch (_error) {
			const error = _error as MongoError;
			if (error.code != 27 || !String(error?.message)?.toLowerCase()?.includes('not found')) {
				throw error;
			}
		}
		const createIndexResult = await this.collection.createIndex(indexSpec, {
			...options,
			name: name,
		});
		return createIndexResult;
	}

	private async ensureIndexes() {
		if (!this?.indexes?.length) {
			return true;
		}
		try {
			const result = await this.collection.indexes();
			if (result?.length != this.indexes.length) {
				await this.createIndexes();
			}
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
}

export abstract class BaseTimeseriesRepository<X, Entity extends BaseTimeseriesEntity<X>, IEntity extends Document = EntityInterface<Entity>> {
	private readonly collection!: Collection<IEntity>;

	abstract getCollectionName(): string;

	constructor(@Inject(DB_CONNECTION) protected readonly dbConnection: Db) {
		this.collection = dbConnection.collection(this.getCollectionName());
	}

	async find(query: Filter<IEntity>, options?: FindOptions<IEntity>) {
		try {
			const docs = await this.collection.find(query, options).toArray();
			return { result: docs };
		} catch (e) {
			return { error: e as Error };
		}
	}

	async insertMany(entities: OptionalUnlessRequiredId<IEntity>[], options?: InsertOneOptions) {
		try {
			const res = await this.collection.insertMany(entities, options);
			return { result: res };
		} catch (e) {
			return { error: e as Error };
		}
	}
}
