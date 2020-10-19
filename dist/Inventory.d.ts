import { IGameState } from './GameState';
import { Item, IItemDef, ISerializedItem } from './Item';
import { Npc } from './Npc';
import { Player } from './Player';
export interface IInventoryDef {
    items?: [string, IItemDef][];
    max?: number;
}
export interface ISerializedInventory {
    items?: [string, IItemDef][];
    max?: number;
}
export declare type InventoryEntityType = Npc | Player | Item;
/**
 * Representation of a `Character` or container `Item` inventory
 * @extends Map
 */
export declare class Inventory extends Map<string, Item> {
    maxSize: number;
    __hydated: boolean;
    private readonly __items;
    /**
     * @param {object} init
     * @param {Array<Item>} init.items
     * @param {number} init.max Max number of items this inventory can hold
     */
    constructor(init?: IInventoryDef);
    /**
     * @param {number} size
     */
    setMax(size: number): void;
    /**
     * @return {number}
     */
    getMax(): number;
    /**
     * @return {boolean}
     */
    get isFull(): boolean;
    /**
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * @param {Item} item
     */
    removeItem(item: Item): void;
    serialize(): {
        items: [string, ISerializedItem][];
        max: number;
    };
    /**
     * @param {GameState} state
     * @param {Character|Item} carriedBy
     */
    hydrate(state: IGameState, carriedBy: InventoryEntityType): void;
}
/**
 * @extends Error
 */
export declare class InventoryFullError extends Error {
}
