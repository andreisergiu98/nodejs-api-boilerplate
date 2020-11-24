import {testDb} from '../../tests/test-db';
import {ModelA} from '../../tests/model-a';
import {ModelB} from '../../tests/model-b';
import {ModelC} from '../../tests/model-c';

import {parseRelations, parseSelect, parseSkip, parseTake, parseWhere} from './resource-query';

beforeAll(async () => {
    await testDb.connect();
});

afterAll(async () => {
    await testDb.connection.close();
});

describe('parseSkipQuery()', () => {
    it('should be parsed', () => {
        expect(parseTake(1, testDb, ModelA)).toBe(1);
    });

    it('should return a number', () => {
        expect(parseTake('1', testDb, ModelA)).toBe(1);
    });

    it('should return undefined', () => {
        expect(parseTake(undefined, testDb, ModelA)).toBe(undefined);
    });

    it('should throw error for zero', () => {
        expect(() => parseTake(0, testDb, ModelA)).toThrow();
    });

    it('should throw error for string zero', () => {
        expect(() => parseTake('0', testDb, ModelA)).toThrow();
    });

    it('should throw error for non numbers', () => {
        expect(() => parseTake('1asd', testDb, ModelA)).toThrow();
    });

    it('should throw error for objects', () => {
        expect(() => parseTake({a: 123, b: 123}, testDb, ModelA)).toThrow();
    });

    it('should throw error for negative numbers', () => {
        expect(() => parseTake(-1, testDb, ModelA)).toThrow();
    });

    it('should throw error for negative string numbers', () => {
        expect(() => parseTake('-1', testDb, ModelA)).toThrow();
    });
});

describe('parseTakeQuery()', () => {
    it('should be parsed', () => {
        expect(parseSkip(1, testDb, ModelA)).toBe(1);
    });

    it('should return a number', () => {
        expect(parseSkip('1', testDb, ModelA)).toBe(1);
    });

    it('should return 0', () => {
        expect(parseSkip(0, testDb, ModelA)).toBe(0);
    });

    it('should return undefined', () => {
        expect(parseTake(undefined, testDb, ModelA)).toBe(undefined);
    });

    it('should throw error for objects', () => {
        expect(() => parseTake({a: 123, b: 123}, testDb, ModelA)).toThrow();
    });

    it('should throw error for negative numbers', () => {
        expect(() => parseSkip(-1, testDb, ModelA)).toThrow();
    });

    it('should throw error for non numbers', () => {
        expect(() => parseSkip('2asd', testDb, ModelA)).toThrow();
    });

    it('should throw error for negative string numbers', () => {
        expect(() => parseSkip('-1', testDb, ModelA)).toThrow();
    });
});

describe('parseSelectQuery()', () => {
    it('should match all columns', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const select = metadata.columns.map(el => el.propertyName);
        expect(parseSelect(select, testDb, ModelB)).toStrictEqual(select);
    });

    it('should match a single column and return an array', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const select = metadata.columns.map(el => el.propertyName);
        expect(parseSelect(select[0], testDb, ModelB)).toStrictEqual([select[0]]);
    });

    it('should throw an error for not matching columns', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const select = metadata.columns.map(el => el.propertyName);
        select.push('missingColumn');
        expect(() => parseSelect(select, testDb, ModelB)).toThrow();
    });
});

describe('parseWhereQuery()', () => {
    it('should match all columns', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const columns = metadata.columns.map(el => el.propertyName);

        const where: Record<string, unknown> = {};
        for (const column of columns) {
            where[column] = '1';
        }

        expect(parseWhere(where, testDb, ModelB)).toStrictEqual(where);
    });

    it('should match array of columns', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const columns = metadata.columns.map(el => el.propertyName);

        const where: Record<string, unknown> = {};
        for (const column of columns) {
            where[column] = '1';
        }

        const list = [where, where, where];
        expect(parseWhere(list, testDb, ModelB)).toStrictEqual(list);
    });

    it('should throw an error for non matching columns', () => {
        const where = {
            nonMatching: '1',
        };
        expect(() => parseWhere(where, testDb, ModelB)).toThrow();
    });

    it('should throw an error for non matching array of columns', () => {
        const where1 = {
            column1: '1',
        };
        const where2 = {
            nonMatching: '1',
        };
        const list = [where1, where2];
        expect(() => parseWhere(list, testDb, ModelB)).toThrow();
    });
});

describe('parseRelationsQuery()', () => {
    it('should match all relations', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const relations = metadata.relations.map(el => el.propertyName);
        expect(parseRelations(relations, testDb, ModelB)).toStrictEqual(relations);
    });

    it('should match a single relation and return an array', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const relation = metadata.relations.map(el => el.propertyName);
        expect(parseRelations(relation[0], testDb, ModelB)).toStrictEqual([relation[0]]);
    });

    it('should match recursive relations', () => {
        const relations = ['modelB', 'modelB.modelA', 'modelB.modelA.modelD'];
        expect(parseRelations(relations, testDb, ModelC)).toStrictEqual(relations);
    });

    it('should throw an error for non matching relations', () => {
        const metadata = testDb.connection.getMetadata(ModelB);
        const relations = metadata.columns.map(el => el.propertyName);
        relations.push('missingRelation');
        expect(() => parseRelations(relations, testDb, ModelB)).toThrow();
    });

    it('should throw an error for non matching recursive relations', () => {
        const relations = ['modelB.modelA.modelC'];
        expect(() => parseRelations(relations, testDb, ModelC)).toThrow();
    });
});