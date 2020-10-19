"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemFactory = void 0;
const EntityFactory_1 = require("./EntityFactory");
const Item_1 = require("./Item");
/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
class ItemFactory extends EntityFactory_1.EntityFactory {
    /**
     * Create a new instance of an item by EntityReference. Resulting item will
     * not be held or equipped and will _not_ have its default contents. If you
     * want it to also populate its default contents you must manually call
     * `item.hydrate(state)`
     *
     * @param {Area}   area
     * @param {string} entityRef
     * @return {Item}
     */
    create(area, entityRef) {
        const item = this.createByType(area, entityRef, Item_1.Item);
        item.area = area;
        return item;
    }
}
exports.ItemFactory = ItemFactory;
