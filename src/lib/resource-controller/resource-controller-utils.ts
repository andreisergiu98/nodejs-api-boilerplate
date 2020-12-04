import {EntityTarget, FindManyOptions, FindOneOptions} from 'typeorm';
import {validate} from 'class-validator';

import {DbClient} from '../db-client';
import {AppError} from '../app-error';
import {ParsedResourceQuery} from '../resource-query';

export async function validatePayload<T>(db: DbClient, targetEntity: EntityTarget<T>, entity?: T, partial = false) {
    const namespace = db.connection.getMetadata(targetEntity).name;
    if (!entity) {
        throw new AppError(400, 'Missing payload object', namespace);
    }
    const instance = db.manager.create(targetEntity, entity);
    const errors = await validate(instance, {
        skipMissingProperties: partial,
    });
    if (errors.length > 0) {
        throw new AppError(400, errors.join(', '), namespace);
    }
    return instance;
}

export async function validateArrayPayload<T>(db: DbClient, targetEntity: EntityTarget<T>, entities?: T[]) {
    const namespace = db.connection.getMetadata(targetEntity).name;
    if (!entities) {
        throw new AppError(400, 'Missing payload object', namespace);
    }
    if (!Array.isArray(entities)) {
        throw new AppError(400, 'Payload is not an array', namespace);
    }
    return Promise.all(entities.map(entity => validatePayload(db, targetEntity, entity)));
}

export function getFindOneOptions<T>(parsedQuery: ParsedResourceQuery) {
    const findConditions: FindOneOptions<T> | undefined = {};

    if (parsedQuery.select) {
        findConditions.select = parsedQuery.select;
    }
    if (parsedQuery.relations) {
        findConditions.relations = parsedQuery.relations;
    }

    if (Object.keys(findConditions).length === 0) return {};
    return findConditions;
}

export function getFindManyOptions<T>(parsedQuery: ParsedResourceQuery) {
    const findConditions: FindManyOptions<T> = {};

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