import {AppError} from '../app-error';

const PG_NOT_NULL_VIOLATION = '23502';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_UNIQUE_VIOLATION = '23505';
const PG_CHECK_VIOLATION = '23514';

const PG_ERROR_CODES = [
    PG_NOT_NULL_VIOLATION,
    PG_UNIQUE_VIOLATION,
    PG_FOREIGN_KEY_VIOLATION,
    PG_CHECK_VIOLATION,
];

export function handleDbQueryError<T>(e: any) {
    if (PG_ERROR_CODES.includes(e.code)) {
        throw new AppError(400, e.detail, e.table);
    }
    throw e;
}

export function HandleDbQueryError() {
    return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            try {
                return await originalMethod.apply(this, args);
            } catch (e) {
                handleDbQueryError(e);
            }
        };
        return descriptor;
    };
}