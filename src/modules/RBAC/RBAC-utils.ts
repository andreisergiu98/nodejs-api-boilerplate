import {EntityMetadata, EntityTarget} from 'typeorm';

import {DbClient} from '../../lib/db-client';

function getTablesFromRelation(relation: string, db: DbClient, metadata: EntityMetadata, tableNames: string[] = []): string[] {
	const [first, ...rest] = relation.split('.');

	const relations = metadata.relations;
	const matchingRelation = relations.find(item => item.propertyName === first);

	if (!matchingRelation) {
		return [];
	}

	const matchingMetadata = matchingRelation.inverseEntityMetadata;
	const tables = [...tableNames, matchingMetadata.tableName];

	if (rest.length === 0) {
		return tables;
	}

	return getTablesFromRelation(rest.join('.'), db, matchingMetadata, tables);
}

export function getTablesFromRelations<T>(relations: string[], db: DbClient, entity: EntityTarget<T>) {
	const metadata = db.connection.getMetadata(entity);

	let tableNames: string[] = [];

	for (const relation of relations) {
		tableNames = [...tableNames, ...getTablesFromRelation(relation, db, metadata)];
	}

	// Remove duplicates
	return [...new Set(tableNames)];
}