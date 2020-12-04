import {EntityMetadata, EntityTarget, ObjectLiteral} from 'typeorm';

import {DbClient} from '../db-client';
import {AppError} from '../app-error';
import {isPlainObject} from '../../utils/object';

interface ResourceQuery {
    take?: unknown;
    skip?: unknown;
    select?: unknown;
    where?: unknown;
    relations?: unknown;
}

export type ParsedResourceQuery = ReturnType<typeof parseResourceQuery>;

export function parseTake<T>(take: unknown, db: DbClient, entity: EntityTarget<T>) {
    // nothing to validate
    if (take == null) return;

    const name = db.connection.getMetadata(entity).tableName;
    const num = Number(take);

    if (isNaN(num)) {
        throw new AppError(400, `'take' query parameter must be a number!`, name);
    }
    if (num <= 0) {
        throw new AppError(400, `'take' query parameter must be a positive number!`, name);
    }
    return num;
}

export function parseSkip<T>(skip: unknown, db: DbClient, entity: EntityTarget<T>) {
    // nothing to validate
    if (skip == null) return;

    const name = db.connection.getMetadata(entity).tableName;
    const num = Number(skip);

    if (isNaN(num)) {
        throw new AppError(400, `'skip' query parameter must be a number!`, name);
    }

    if (num < 0) {
        throw new AppError(400, `'skip' query parameter cannot be negative!`, name);
    }

    return num;
}

function whereCheck(where: unknown, db: DbClient, metadata: EntityMetadata) {
    // nothing to validate
    if (!where) return;

    const name = metadata.tableName;
    if (typeof where !== 'object') {
        throw new AppError(400, `'where' property must be a query!`, name);
    }
    if (!isPlainObject(where)) {
        throw new AppError(400, `'where' property must be a query!`, name);
    }

    for (const key in where) {
        if (!where.hasOwnProperty(key)) continue;

        const column = metadata.findColumnWithPropertyName(key);

        if (!column) {
            throw new AppError(400, `Property '${key}' from 'where' query does not exist in resource!`, name);
        }
    }
}

// TODO maybe add support for embedded columns
export function parseWhere<T>(where: unknown, db: DbClient, entity: EntityTarget<T>) {
    // nothing to validate
    if (!where) return;

    const metadata = db.connection.getMetadata(entity);

    if (!Array.isArray(where)) {
        whereCheck(where, db, metadata);
        return where as ObjectLiteral;
    }
    for (const item of where) {
        whereCheck(item, db, metadata);
    }

    return where as ObjectLiteral[];
}

export function parseSelect<T>(select: unknown, db: DbClient, entity: EntityTarget<T>) {
    // nothing to validate
    if (select == null) return;

    const metadata = db.connection.getMetadata(entity);
    const name = metadata.tableName;

    const list = Array.isArray(select) ? select : [select];

    for (const item of list) {
        if (typeof item !== 'string') {
            throw new AppError(400, `'select' query must be a string or a string list!`, name);
        }

        const column = metadata.findColumnWithPropertyName(item);
        if (!column) {
            throw new AppError(400, `Property '${item}' from 'select' query does not exist in resource!`, name);
        }
    }

    return list;
}

function relationsCheck(relation: string, db: DbClient, metadata: EntityMetadata): boolean {
    const [first, ...rest] = relation.split('.');

    const relations = metadata.relations;
    const matchingRelation = relations.find(item => item.propertyName === first);

    if (!matchingRelation) {
        return false;
    }
    if (rest.length === 0) {
        return true;
    }

    const matchingMetadata = matchingRelation.inverseEntityMetadata;
    return relationsCheck(rest.join('.'), db, matchingMetadata);
}

export function parseRelations<T>(relations: unknown, db: DbClient, entity: EntityTarget<T>) {
    if (!relations) return;

    const list = Array.isArray(relations) ? relations : [relations];

    const metadata = db.connection.getMetadata(entity);
    const name = metadata.tableName;

    for (const relation of list) {
        if (typeof relation !== 'string') {
            throw new AppError(400, `'relation' query must be a string or a string list!`, name);
        }

        const valid = relationsCheck(relation, db, metadata);
        if (!valid) {
            throw new AppError(400, `Property ${relation} from 'relation' query does not exist in resource!`, name);
        }
    }

    return list;
}

function deserializeQuery(query: string) {
    try {
        return JSON.parse(query) as ResourceQuery;
    } catch (e) {
        throw new AppError(400, `Cannot deserialize resource query`);
    }
}

export function parseResourceQuery<T>(rawQuery: string, db: DbClient, entity: EntityTarget<T>) {
    const resourceQuery: ResourceQuery = deserializeQuery(rawQuery);

    const take = parseTake(resourceQuery.take, db, entity);
    const skip = parseSkip(resourceQuery.skip, db, entity);
    const where = parseWhere(resourceQuery.where, db, entity);
    const select = parseSelect(resourceQuery.select, db, entity);
    const relations = parseRelations(resourceQuery.relations, db, entity);

    return {
        take,
        skip,
        where,
        select,
        relations,
    };
}