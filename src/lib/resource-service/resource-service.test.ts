import {testDb} from '../../tests/test-db';
import {ModelA} from '../../tests/model-a';
import {ResourceService} from './resource-service';
import {AppError} from '../app-error';

beforeAll(async () => {
    await testDb.connect();

    await testDb.manager.insert(ModelA, [{
        column1: 'item1_column1',
    }, {
        column1: 'item2_column1',
        column2: 'item2_column2',

    }, {
        column1: 'item3_column1',
        column2: 'item3_column2',
    }]);
});

afterAll(async () => {
    await testDb.manager.createQueryBuilder()
        .delete()
        .from(ModelA)
        .where('true')
        .execute();
    await testDb.connection.close();
});

describe('resourceService.get()', () => {
    it('should find the item', async () => {
        const service = new ResourceService(testDb, ModelA);
        let testItem = testDb.manager.create(ModelA, {
            column1: 'get_test1',
        });
        testItem = await testDb.manager.save(testItem);
        expect(await service.getById(testItem.id)).toEqual(testItem);
    });
    it('should throw an error when not found', async () => {
        const service = new ResourceService(testDb, ModelA);
        await expect(() => service.getById(-1)).rejects.toThrow(AppError);
    });
    it('should get 2 items', async () => {
        const service = new ResourceService(testDb, ModelA);
        const items = await service.getMany({
            where: [{column1: 'item1_column1'}, {column1: 'item2_column1'}]
        });
        expect(items.length).toBe(2);
    });
    it('should get an empty array', async () => {
        const service = new ResourceService(testDb, ModelA);
        const items = await service.getMany({
            where: {
                id: -1,
            }
        });
        expect(items.length).toBe(0);
    });
});

describe('resourceService.create()', () => {
    it('should successfully insert item', async () => {
        const service = new ResourceService(testDb, ModelA);
        const item = testDb.manager.create(ModelA, {
            column1: 'insert_1_test',
            column2: null,
        });
        expect(await service.create(item)).toEqual(
            expect.objectContaining({
                column1: 'insert_1_test',
                column2: null,
            })
        );
    });
    it('should successfully insert multiple items', async () => {
        const service = new ResourceService(testDb, ModelA);
        const item1 = testDb.manager.create(ModelA, {
            column1: 'insert_many_test1',
            column2: null,
        });
        const item2 = testDb.manager.create(ModelA, {
            column1: 'insert_many_test2',
            column2: null,
        });
        const item3 = testDb.manager.create(ModelA, {
            column1: 'insert_many_test3',
            column2: null,
        });
        expect((await service.create([item1, item2, item3])).length).toEqual(3);
    });
    it(`should throw 'not null violation' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        // @ts-ignore
        const item = testDb.manager.create(ModelA, {
            column1: null,
            column2: 'test',
        } as unknown);
        await expect(() => service.create(item)).rejects.toThrow(AppError);
    });
    it(`should throw 'unique_violation' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        const item = testDb.manager.create(ModelA, {
            column1: 'item1_column1',
            column2: null,
        });
        await expect(() => service.create(item)).rejects.toThrow(AppError);
    });
    it(`should throw 'foreign_key_violation' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        const item = testDb.manager.create(ModelA, {
            column1: '',
            column2: null,
            modelDId: 5,
        });
        await expect(() => service.create(item)).rejects.toThrow(AppError);
    });
});

describe('resourceService.update()', () => {
    it('should successfully update item', async () => {
        const service = new ResourceService(testDb, ModelA);
        const targetId = (await service.getMany())[0].id;

        const item = testDb.manager.create(ModelA, {
            column1: 'new_column',
            column2: null,
        });

        expect(await service.update(targetId, item)).toEqual(
            expect.objectContaining({
                column1: 'new_column',
                column2: null,
            })
        );
    });
    it(`should throw 'not found' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        const item = testDb.manager.create(ModelA, {
            column1: 'new_column',
            column2: null,
        });
        await expect(() => service.update(-1, item)).rejects.toThrow(AppError);
    });
    it(`should throw 'not null violation' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        const targetId = (await service.getMany())[0].id;

        // @ts-ignore
        const item = testDb.manager.create(ModelA, {
            column1: null,
            column2: 'test',
        } as unknown);

        await expect(() => service.update(targetId, item)).rejects.toThrow(AppError);
    });
    it(`should throw 'unique_violation' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        const targetId = (await service.getMany())[0].id;

        const item = testDb.manager.create(ModelA, {
            column1: 'new_column',
            column2: null,
        });

        await expect(() => service.update(targetId, item)).rejects.toThrow(AppError);
    });
    it(`should throw 'foreign_key_violation' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        const targetId = (await service.getMany())[0].id;

        const item = testDb.manager.create(ModelA, {
            column1: 'test2',
            column2: null,
            modelDId: 5,
        });

        await expect(() => service.update(targetId, item)).rejects.toThrow(AppError);
    });
});

describe('resourceService.delete()', () => {
    it('should successfully delete item', async () => {
        const service = new ResourceService(testDb, ModelA);
        const targetId = (await service.getMany())[0].id;
        await expect(await service.delete(targetId)).toBeUndefined();

    });
    it(`should throw 'not found' error`, async () => {
        const service = new ResourceService(testDb, ModelA);
        await expect(() => service.delete(0)).rejects.toThrow(AppError);
    });
});