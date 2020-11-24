import {EntityTarget, FindManyOptions, FindOneOptions} from 'typeorm';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

import {DbClient} from '../db-client';
import {AppError} from '../app-error';
import {HandleDbQueryError} from './resource-service-utils';

export class ResourceService<T> {
    constructor(
        private readonly db: DbClient,
        private readonly targetEntity: EntityTarget<T>
    ) {
    }

    async getById(id: number, options?: FindOneOptions<T>) {
        const res = await this.db.manager.findOne(this.targetEntity, id, options);
        if (res) return res;

        throw  new AppError(404, 'Entity not found', this.namespace);
    }

    async getMany(options?: FindManyOptions<T>) {
        return this.db.manager.find(this.targetEntity, options);
    }

    @HandleDbQueryError()
    async create(payload: T | T[]) {
        const isArray = Array.isArray(payload);

        const res = await this.db.manager
            .createQueryBuilder()
            .insert()
            .into(this.targetEntity)
            .values(payload)
            .returning('*')
            .execute();

        return (isArray ? res.raw : res.raw[0]);
    }

    async update(id: number, payload: T) {
        return this.patch(id, payload);
    }

    @HandleDbQueryError()
    async updateMany(payload: T[]) {
        return this.db.manager.save(this.targetEntity, payload, {
            chunk: 10000,
        });
    }

    @HandleDbQueryError()
    async patch(id: number, payload: QueryDeepPartialEntity<T>) {
        const exists = await this.existsById(id);
        if (!exists) {
            throw new AppError(404, `Entity doesn't exist`, this.namespace);
        }

        return this.db.manager
            .createQueryBuilder()
            .update(this.targetEntity)
            .where('id = :id', {id})
            .set(payload)
            .returning('*')
            .execute()
            .then(res => res.raw[0]);
    }

    async delete(id: number) {
        const exists = await this.existsById(id);

        if (!exists) {
            throw new AppError(404, 'Entity not found', this.namespace);
        }

        await this.db.manager
            .createQueryBuilder()
            .delete()
            .from(this.targetEntity)
            .where('id = :id', {id})
            .execute();
    }

    protected async existsById(id: number) {
        const select = this.db.manager
            .createQueryBuilder()
            .select('*')
            .from(this.targetEntity, 'entity')
            .where('entity.id = $1')
            .getQuery();

        const existsQuery = `select exists(${select})`;

        const res = await this.db.manager.query(existsQuery, [id]);
        return res?.[0]?.exists === true;
    }

    protected get namespace() {
        return this.db.connection.getMetadata(this.targetEntity).tableName;
    }
}