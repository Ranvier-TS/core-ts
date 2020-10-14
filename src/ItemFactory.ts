import { Area } from "./Area";
import { EntityFactory } from "./EntityFactory";
import { EntityReference } from "./EntityReference";
import { Item } from "./Item";

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
export class ItemFactory extends EntityFactory {
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
  create(area: Area, entityRef: EntityReference) {
    const item = this.createByType(area, entityRef, Item);
    item.area = area;
    return item as Item;
  }
}
