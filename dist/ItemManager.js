"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemManager = void 0;
const ItemType_1 = require("./ItemType");
const Room_1 = require("./Room");
/**
 * Keep track of all items in game
 */
class ItemManager {
    constructor() {
        this.items = new Set();
    }
    add(item) {
        this.items.add(item);
    }
    remove(item) {
        if (item.room && item.room instanceof Room_1.Room) {
            item.room.removeItem(item);
        }
        if (item.carriedBy) {
            item.carriedBy.removeItem(item);
        }
        if (item.type === ItemType_1.ItemType.CONTAINER && item.inventory) {
            item.inventory.forEach((childItem) => this.remove(childItem));
        }
        item.__pruned = true;
        item.removeAllListeners();
        this.items.delete(item);
    }
    /**
     * @fires Item#updateTick
     */
    tickAll() {
        for (const item of this.items) {
            /**
             * @event Item#updateTick
             */
            item.emit('updateTick');
        }
    }
}
exports.ItemManager = ItemManager;
