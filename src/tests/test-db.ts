import {DbClient} from '../lib/db-client';
import {createDbConfig} from '../config/db';

import {ModelA} from './model-a';
import {ModelB} from './model-b';
import {ModelC} from './model-c';

export const testDb = new DbClient({
	...createDbConfig('postgres://root:root@localhost:5460/api_db', 'default', true),
	synchronize: true,
	entities: [
		ModelA,
		ModelB,
		ModelC,
	],
});