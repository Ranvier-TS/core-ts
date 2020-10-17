import { DataSourceRegistry } from './DataSourceRegistry';
import { EntityLoader } from './EntityLoader';

export enum EntityLoaderKeys {
	ACCOUNT = 'accounts',
	AREAS = 'areas',
	HELP = 'help',
	ITEMS = 'items',
	NPCS = 'npcs',
	PLAYERS = 'players',
	QUESTS = 'quests',
	ROOMS = 'rooms',
}
export interface EntityLoaderConfig {
	source: string;
	config?: object;
}
/**
 * Holds instances of configured EntityLoaders
 * @type {Map<string, EntityLoader>}
 */
export class EntityLoaderRegistry extends Map<EntityLoaderKeys, EntityLoader> {
	get(key: EntityLoaderKeys) {
		const entityLoader = super.get(key);
		if (!entityLoader) {
			throw new Error(
				`EntityLoaderRegistry did not find the entityloader with key of [${key}]`
			);
		}
		return entityLoader;
  }
  
	load(sourceRegistry: DataSourceRegistry, config: EntityLoaderConfig) {
		for (const [name, settings] of Object.entries(config)) {
			if (!settings.hasOwnProperty('source')) {
				throw new Error(`EntityLoader [${name}] does not specify a 'source'`);
			}

			if (typeof settings.source !== 'string') {
				throw new TypeError(`EntityLoader [${name}] has an invalid 'source'`);
			}

			const source = sourceRegistry.get(settings.source);

			if (!source) {
				throw new Error(
					`Invalid source [${settings.source}] for entity [${name}]`
				);
			}

			const sourceConfig = settings.config || {};
			const dataSource = sourceRegistry.get(settings.source);

			if (!dataSource) {
				throw new Error(`Invalid source [${settings.source}]`);
			}
			this.set(name, new EntityLoader(dataSource, sourceConfig));
		}
	}
}