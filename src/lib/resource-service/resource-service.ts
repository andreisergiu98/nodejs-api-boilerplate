import {EntityTarget, FindManyOptions, FindOneOptions} from 'typeorm';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

import {DbClient} from '../db-client';
import {handleQueryError} from '../query-error';

export class ResourceService<T> {
    constructor(
        private readonly db: DbClient,
        private readonly targetEntity: EntityTarget<T>
    ) {
    }

    getById = async (id: number, options: FindOneOptions<T>) => {
        return this.db.manager.findOne(this.targetEntity, id, options);
    };

    getMany = async (options: FindManyOptions<T>) => {
        return this.db.manager.find(this.targetEntity, options);
    };

    create = async (payload: T) => {
        try {
            return this.db.manager
                .createQueryBuilder()
                .insert()
                .into(this.targetEntity)
                .values(payload)
                .returning('*')
                .execute();
        } catch (e) {
            handleQueryError(this.db, this.targetEntity, e);
        }
    };

    update = async (id: number, payload: T) => {
        try {
            return this.patch(id, payload);
        } catch (e) {
            handleQueryError(this.db, this.targetEntity, e);
        }
    };

    updateMany = async (payload: T[]) => {
        try {
            await this.db.manager.save(this.targetEntity, payload);
        } catch (e) {
            handleQueryError(this.db, this.targetEntity, e);
        }
    };

    patch = async (id: number, payload: QueryDeepPartialEntity<T>) => {
        try {
            return this.db.manager
                .createQueryBuilder()
                .update(this.targetEntity)
                .where('id = :id', {id})
                .set(payload)
                .returning('*')
                .execute();
        } catch (e) {
            handleQueryError(this.db, this.targetEntity, e);
        }
    };

    delete = async (id: number) => {
        try {
            await this.db.manager
                .createQueryBuilder()
                .delete()
                .from(this.targetEntity)
                .where('id = :id', {id})
                .execute();
        } catch (e) {
            handleQueryError(this.db, this.targetEntity, e);
        }
    };
}