import {EntityTarget, FindManyOptions, FindOneOptions} from 'typeorm';
import {validate} from 'class-validator';

import {DbClient} from '../db-client';
import {AppError} from '../app-error';
import {parseResourceQuery} from '../resource-query';

export async function validatePayload<T>(db: DbClient, targetEntity: EntityTarget<T>, entity?: T) {
    const name = db.connection.getMetadata(targetEntity).name;
    if (!entity) {
        throw new AppError(400, 'Missing payload object', name);
    }
    const instance = db.manager.create(targetEntity, entity);
    const errors = await validate(instance);
    if (errors.length > 0) {
        throw new AppError(400, errors.join(', '), name);
    }
    return instance;
}

export async function validateArrayPayload<T>(db: DbClient, targetEntity: EntityTarget<T>, entities?: T[]) {
    const name = db.connection.getMetadata(targetEntity).name;
    if (!entities) {
        throw new AppError(400, 'Missing payload object', name);
    }
    if (!Array.isArray(entities)) {
        throw new AppError(400, 'Payload is not an array', name);
    }
    return Promise.all(entities.map(entity => validatePayload(db, targetEntity, entity)));
}

export function getFindOneOptions<T>(rawQuery: string, db: DbClient, targetEntity: EntityTarget<T>) {
    const findConditions: FindOneOptions<T> | undefined = {};
    const parsedQuery = parseResourceQuery(rawQuery, db, targetEntity);

    if (parsedQuery.select) {
        findConditions.select = parsedQuery.select;
    }
    if (parsedQuery.relations) {
        findConditions.relations = parsedQuery.relations;
    }

    if (Object.keys(findConditions).length === 0) return {};
    return findConditions;
}

export function getFindManyOptions<T>(rawQuery: string, db: DbClient, targetEntity: EntityTarget<T>) {
    const findConditions: FindManyOptions<T> = {};
    const parsedQuery = parseResourceQuery(rawQuery, db, targetEntity);

    if (parsedQuery.where) {
        findConditions.where = parsedQuery.where;
    }
    if (parsedQuery.select) {
        findConditions.select = parsedQuery.select;
    }
    if (parsedQuery.relations) {
        findConditions.relations = parsedQuery.relations;
    }
    if (parsedQuery.skip) {
        findConditions.skip = parsedQuery.skip;
    }
    if (parsedQuery.take) {
        findConditions.take = parsedQuery.take;
    }

    if (Object.keys(findConditions).length === 0) return {};
    return findConditions;
}