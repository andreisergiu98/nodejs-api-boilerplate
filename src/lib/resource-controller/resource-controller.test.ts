import crypto from 'crypto';
import {testDb} from '../../tests/test-db';
import {ModelA} from '../../tests/model-a';
import {
    getFindManyOptions,
    getFindOneOptions,
    validateArrayPayload,
    validatePayload
} from './resource-controller-utils';

beforeAll(async () => {
    await testDb.connect();
});

afterAll(async () => {
    await testDb.connection.close();
});

describe('validatePayload()', () => {
    it('should be valid', async () => {
        const payload = {
            id: 1,
            column1: 'a',
            column2: 'b',
        } as ModelA;
        expect(await validatePayload(testDb, ModelA, payload)).toEqual(payload);
    });
    it('should throw error as id is not string', async () => {
        const payload = {
            id: '1',
            column1: 'a',
            column2: 'b',
        } as unknown;
        await expect(() => validatePayload(testDb, ModelA, payload)).rejects.toThrow();
    });
    it('should throw error as required column is missing', async () => {
        const payload = {
            id: 1,
            column2: 'b',
        } as unknown;
        await expect(() => validatePayload(testDb, ModelA, payload)).rejects.toThrow();
    });
    it('should throw error as string is too long', async () => {
        const payload = {
            id: 1,
            // generate a string with 52 characters
            column1: crypto.randomBytes(26).toString('hex'),
            column2: 'b',
        } as unknown;
        await expect(() => validatePayload(testDb, ModelA, payload)).rejects.toThrow();
    });
    it('should throw error as string is too short', async () => {
        const payload = {
            id: 1,
            column1: '',
            column2: 'b',
        } as unknown;
        await expect(() => validatePayload(testDb, ModelA, payload)).rejects.toThrow();
    });
});

describe('validateArrayPayload()', () => {
    it('should be valid', async () => {
        const payload = [{
            id: 1,
            column1: 'a',
            column2: 'b',
        }] as ModelA[];
        expect(await validateArrayPayload(testDb, ModelA, payload)).toEqual(payload);
    });
    it('should throw error as payload is not an array', async () => {
        const payload = {
            id: 1,
            column1: 'a',
            column2: 'b',
        } as unknown as ModelA[];
        await expect(() => validateArrayPayload(testDb, ModelA, payload)).rejects.toThrow();
    });
    it('should throw error as required column is missing', async () => {
        const payload = [{
            id: 1,
            column1: 'a',
            column2: 'b',
        }, {
            id: 2,
            column2: 'b',
        }] as ModelA[];
        await expect(() => validateArrayPayload(testDb, ModelA, payload)).rejects.toThrow();
    });
});

describe('getFindOneOptions()', () => {
    it('should be valid', async () => {
        const payload = {
            select: ['column1'],
            relations: ['modelD'],
        };
        const query = JSON.stringify(payload);
        expect(getFindOneOptions(query, testDb, ModelA)).toEqual(payload);
    });
    it(`should throw error as relation doesn't exist`, async () => {
        const payload = {
            relations: ['invalidRelation'],
        };
        const query = JSON.stringify(payload);
        expect(() => getFindOneOptions(query, testDb, ModelA)).toThrow();
    });
    it(`should throw error as column doesn't exist`, async () => {
        const payload = {
            select: ['invalidColumn'],
        };
        const query = JSON.stringify(payload);
        expect(() => getFindOneOptions(query, testDb, ModelA)).toThrow();
    });
});

describe('getFindManyOptions()', () => {
    it('should be valid', async () => {
        const payload = {
            where: [{column1: 'a'}, {column2: 'b'}],
            select: ['column1'],
            relations: ['modelD'],
            skip: 1,
            take: 10,
        };
        const query = JSON.stringify(payload);
        expect(getFindManyOptions(query, testDb, ModelA)).toEqual(payload);
    });
    it(`should throw error as skip should be a number`, async () => {
        const payload = {
            relations: ['invalidColumn'],
        };
        const query = JSON.stringify(payload);
        expect(() => getFindManyOptions(query, testDb, ModelA)).toThrow();
    });
    it(`should throw error as relation doesn't exist`, async () => {
        const payload = {
            relations: ['invalidRelation'],
        };
        const query = JSON.stringify(payload);
        expect(() => getFindManyOptions(query, testDb, ModelA)).toThrow();
    });
    it(`should throw error as column doesn't exist`, async () => {
        const payload = {
            select: ['invalidColumn'],
        };
        const query = JSON.stringify(payload);
        expect(() => getFindManyOptions(query, testDb, ModelA)).toThrow();
    });
    it(`should throw error as column doesn't exist`, async () => {
        const payload = {
            where: {invalidColumn: 'asd'},
        };
        const query = JSON.stringify(payload);
        expect(() => getFindManyOptions(query, testDb, ModelA)).toThrow();
    });
    it(`should throw error as column doesn't exist`, async () => {
        const payload = {
            where: [{column1: 'a'}, {invalidColumn: 'asd'}],
        };
        const query = JSON.stringify(payload);
        expect(() => getFindManyOptions(query, testDb, ModelA)).toThrow();
    });
    it(`should throw error as skip should be a number`, async () => {
        const payload = {
            skip: '10a',
        };
        const query = JSON.stringify(payload);
        expect(() => getFindManyOptions(query, testDb, ModelA)).toThrow();
    });
    it(`should throw error as take should be a number`, async () => {
        const payload = {
            take: '10a',
        };
        const query = JSON.stringify(payload);
        expect(() => getFindManyOptions(query, testDb, ModelA)).toThrow();
    });
});