import { Item } from './Item';
/**
 * Keep track of all items in game
 */
export declare class ItemManager {
    items: Set<Item>;
    constructor();
    add(item: Item): void;
    remove(item: Item): void;
    /**
     * @fires Item#updateTick
     */
    tickAll(): void;
}
