import { DataSourceRegistry } from './DataSourceRegistry';
import { EntityLoader, IEntityLoaderConfig } from './EntityLoader';
export declare enum EntityLoaderKeys {
    ACCOUNT = "accounts",
    AREAS = "areas",
    HELP = "help",
    ITEMS = "items",
    NPCS = "npcs",
    PLAYERS = "players",
    QUESTS = "quests",
    ROOMS = "rooms"
}
export interface EntityLoaderConfig {
    source: string;
    config: IEntityLoaderConfig;
}
export declare type EntityLoaderJsonFile = Record<EntityLoaderKeys, EntityLoaderConfig>;
/**
 * Holds instances of configured EntityLoaders
 * @type {Map<string, EntityLoader>}
 */
export declare class EntityLoaderRegistry extends Map<EntityLoaderKeys, EntityLoader> {
    get(key: EntityLoaderKeys): EntityLoader;
    load(sourceRegistry: DataSourceRegistry, config: EntityLoaderJsonFile): void;
}
