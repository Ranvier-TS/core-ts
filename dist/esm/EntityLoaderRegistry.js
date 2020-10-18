import { EntityLoader } from './EntityLoader';
export var EntityLoaderKeys;
(function (EntityLoaderKeys) {
    EntityLoaderKeys["ACCOUNT"] = "accounts";
    EntityLoaderKeys["AREAS"] = "areas";
    EntityLoaderKeys["HELP"] = "help";
    EntityLoaderKeys["ITEMS"] = "items";
    EntityLoaderKeys["NPCS"] = "npcs";
    EntityLoaderKeys["PLAYERS"] = "players";
    EntityLoaderKeys["QUESTS"] = "quests";
    EntityLoaderKeys["ROOMS"] = "rooms";
})(EntityLoaderKeys || (EntityLoaderKeys = {}));
/**
 * Holds instances of configured EntityLoaders
 * @type {Map<string, EntityLoader>}
 */
export class EntityLoaderRegistry extends Map {
    get(key) {
        const entityLoader = super.get(key);
        if (!entityLoader) {
            throw new Error(`EntityLoaderRegistry did not find the entityloader with key of [${key}]`);
        }
        return entityLoader;
    }
    load(sourceRegistry, config) {
        for (const [name, settings] of Object.entries(config)) {
            if (!settings.hasOwnProperty('source')) {
                throw new Error(`EntityLoader [${name}] does not specify a 'source'`);
            }
            if (typeof settings.source !== 'string') {
                throw new TypeError(`EntityLoader [${name}] has an invalid 'source'`);
            }
            if (!(name in EntityLoaderKeys)) {
                throw new Error(`EntityLoader [${name}] is not a register source`);
            }
            const source = sourceRegistry.get(settings.source);
            if (!source) {
                throw new Error(`Invalid source [${settings.source}] for entity [${name}]`);
            }
            const sourceConfig = settings.config || {};
            if (!source) {
                throw new Error(`Invalid source [${settings.source}]`);
            }
            this.set(name, new EntityLoader(source, sourceConfig));
        }
    }
}
