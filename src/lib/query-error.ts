import {DbClient} from './db-client';
import {EntityTarget} from 'typeorm';
import {AppError} from './app-error';

const PG_UNIQUE_CONSTRAINT_ERROR = 'PG_UNIQUE_CONSTRAINT_VIOLATION';

export function handleQueryError<T>(db: DbClient, targetEntity: EntityTarget<T>, e: any) {
    const name = db.connection.getMetadata(targetEntity).name;
    if (e.code === PG_UNIQUE_CONSTRAINT_ERROR) {
        throw new AppError(400, e.detail, name);
    }
    throw e;
}