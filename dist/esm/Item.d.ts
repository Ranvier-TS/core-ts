import { Area } from './Area';
import { GameEntity } from './GameEntity';
import { IInventoryDef, Inventory, InventoryEntityType, ISerializedInventory } from './Inventory';
import { ItemType } from './ItemType';
import { Room } from './Room';
import { IGameState } from './GameState';
import { Character } from './Character';
import { ISerializedEffect } from './Effect';
import { SerializedAttributes } from './EffectableEntity';
import { ItemManager } from './ItemManager';
export declare interface IItemDef {
    name: string;
    id: string;
    attributes?: SerializedAttributes;
    effects?: ISerializedEffect[];
    description?: string;
    inventory?: IInventoryDef;
    metadata?: Record<string, any>;
    behaviors?: Record<string, any>;
    items?: IItemDef[];
    maxItems?: number;
    isEquipped?: boolean;
    entityReference: string;
    room?: string | Room | null;
    roomDesc?: string;
    script?: string;
    type?: ItemType | string;
    uuid?: string;
    closeable?: boolean;
    closed?: boolean;
    locked?: boolean;
    lockedBy?: string | null;
    carriedBy?: InventoryEntityType;
    area: string;
    keywords: string[];
}
export interface ISerializedItem {
    attributes: SerializedAttributes;
    effects: ISerializedEffect[];
    entityReference: string;
    inventory: ISerializedInventory;
    metadata: Record<string, any>;
    description: string;
    keywords: string[];
    name: string;
    roomDesc: string;
    closed: boolean;
    locked: boolean;
    behaviors: Record<string, any>;
    area: string;
    id: string;
}
/**
 * @property {Area}    area        Area the item belongs to (warning: this is not the area is currently in but the
 *                                 area it belongs to on a fresh load)
 * @property {object}  metadata    Essentially a blob of whatever attrs the item designer wanted to add
 * @property {Array}   behaviors   list of behaviors this object uses
 * @property {string}  description Long description seen when looking at it
 * @property {number}  id          vnum
 * @property {boolean} isEquipped  Whether or not item is currently equipped
 * @property {?Character} equippedBy Entity that has this equipped
 * @property {Map}     inventory   Current items this item contains
 * @property {string}  name        Name shown in inventory and when equipped
 * @property {?Room}   room        Room the item is currently in
 * @property {string}  roomDesc    Description shown when item is seen in a room
 * @property {string}  script      A custom script for this item
 * @property {ItemType|string} type
 * @property {string}  uuid        UUID differentiating all instances of this item
 * @property {boolean} closeable   Whether this item can be closed (Default: false, true if closed or locked is true)
 * @property {boolean} closed      Whether this item is closed
 * @property {boolean} locked      Whether this item is locked
 * @property {?entityReference} lockedBy Item that locks/unlocks this item
 * @property {?(Character|Item)} carriedBy Entity that has this in its Inventory
 *
 * @extends GameEntity
 */
export declare class Item extends GameEntity {
    name: string;
    id: string;
    area: Area;
    description: string;
    metadata: Record<string, unknown>;
    behaviors: Map<string, any>;
    defaultItems: IItemDef[] | string[];
    entityReference: string;
    inventory: Inventory;
    maxItems: number;
    isEquipped: boolean;
    room: string | Room | null;
    roomDesc: string;
    script: string | null;
    type: ItemType | string;
    uuid: string;
    closeable: boolean;
    closed: boolean;
    locked: boolean;
    lockedBy: string | null;
    sourceRoom: Room | null;
    carriedBy: InventoryEntityType | Character | null;
    equippedBy: InventoryEntityType | Character | string | null;
    keywords: string[];
    __manager?: ItemManager;
    __pruned: boolean;
    constructor(area: Area, item: IItemDef);
    /**
     * Create an Inventory object from a serialized inventory
     * @param {object} inventory Serialized inventory
     */
    initializeInventoryFromSerialized(inventory?: IInventoryDef): void;
    hasKeyword(keyword: string): boolean;
    /**
     * Add an item to this item's inventory
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * Remove an item from this item's inventory
     * @param {Item} item
     */
    removeItem(item: Item): void;
    /**
     * @return {boolean}
     */
    isInventoryFull(): boolean;
    /**
     * Helper to find the game entity that ultimately has this item in their
     * Inventory in the case of nested containers. Could be an item, player, or
     * @return {Character|Item|null} owner
     */
    findCarrier(): Character | Item | null;
    /**
     * Open a container-like object
     */
    open(): void;
    /**
     * Close a container-like object
     */
    close(): void;
    /**
     * Lock a container-like object
     */
    lock(): void;
    /**
     * Unlock a container-like object
     */
    unlock(): void;
    hydrate(state: IGameState, serialized?: IItemDef): false | undefined;
    serialize(): ISerializedItem;
}
