import crypto from 'crypto';
import {testDb} from '../../tests/test-db';
import {ModelA} from '../../tests/model-a';
import {validateArrayPayload, validatePayload} from './resource-controller-utils';

beforeAll(async () => {
	await testDb.connect();
});

afterAll(async () => {
	await testDb.connection.close();
});

describe('validatePayload()', () => {
	it('should validate', async () => {
		const payload = {
			id: 1,
			column1: 'a',
			column2: 'b',
		} as ModelA;
		expect(await validatePayload(testDb, ModelA, payload)).toEqual(payload);
	});
	it('should validate partial objects', async () => {
		const payload = {
			column2: 'b',
		} as ModelA;
		expect(await validatePayload(testDb, ModelA, payload, true)).toEqual(payload);
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