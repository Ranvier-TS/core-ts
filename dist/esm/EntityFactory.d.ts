import { Area } from './Area';
import { AreaFactory } from './AreaFactory';
import { BehaviorManager } from './BehaviorManager';
import { EntityReference } from './EntityReference';
import { Item } from './Item';
import { ItemFactory } from './ItemFactory';
import { MobFactory } from './MobFactory';
import { Npc } from './Npc';
import { Room } from './Room';
import { RoomFactory } from './RoomFactory';
export declare type EntityFactoryType = ItemFactory | MobFactory | RoomFactory | AreaFactory;
/**
 * Stores definitions of entities to allow for easy creation/cloning
 */
export declare class EntityFactory {
    entities: Map<EntityReference, any>;
    scripts: BehaviorManager;
    constructor();
    /**
     * Create the key used by the entities and scripts maps
     * @param {string} areaName
     * @param {number} id
     * @return {string}
     */
    createEntityRef(area: string, id: string | number): string;
    /**
     * @param {string} entityRef
     * @return {Object}
     */
    getDefinition(entityRef: EntityReference): any;
    /**
     * @param {string} entityRef
     * @param {Object} def
     */
    setDefinition(entityRef: EntityReference, def: any): void;
    /**
     * Add an event listener from a script to a specific item
     * @see BehaviorManager::addListener
     * @param {string}   entityRef
     * @param {string}   event
     * @param {Function} listener
     */
    addScriptListener(entityRef: EntityReference, event: string, listener: Function): void;
    /**
     * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
     * and will _not_ have its default contents. If you want it to also populate its default contents
     * you must manually call `npc.hydrate(state)`
     *
     * @param {Area}   area
     * @param {string} entityRef
     * @param {Class}  Type      Type of entity to instantiate
     * @return {type}
     */
    createByType(area: Area, entityRef: EntityReference, Type: typeof Room | typeof Npc | typeof Item): Npc | Item | Room;
    create(...args: any[]): void;
    /**
     * Clone an existing entity
     *
     * @param {Item|Npc|Room|Area} entity
     * @return {Item|Npc|Room|Area}
     */
    clone(entity: Room | Npc | Item | Area): void;
}
