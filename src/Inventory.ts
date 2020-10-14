import { Character } from "./Character";
import { IGameState } from "./GameState";
import { Item, ItemDef } from "./Item";
import { Npc } from "./Npc";
import { Player } from "./Player";

export declare interface IInventoryDef {
  items?: [string, ItemDef | Item][];
  max?: number;
}

export declare interface ISerializedInventory {
  items?: [string, ItemDef][];
  max?: number;
}

/**
 * Representation of a `Character` or container `Item` inventory
 * @extends Map
 */
export class Inventory extends Map<string, ItemDef | Item> {
  maxSize: number;

  /**
   * @param {object} init
   * @param {Array<Item>} init.items
   * @param {number} init.max Max number of items this inventory can hold
   */
  constructor(init: IInventoryDef = {}) {
    init = Object.assign(
      {
        items: [],
        max: Infinity,
      },
      init
    );

    super(init.items);
    this.maxSize = init.max || Infinity;
  }

  /**
   * @param {number} size
   */
  setMax(size: number) {
    this.maxSize = size;
  }

  /**
   * @return {number}
   */
  getMax() {
    return this.maxSize;
  }

  /**
   * @return {boolean}
   */
  get isFull() {
    return this.size >= this.maxSize;
  }

  /**
   * @param {Item} item
   */
  addItem(item: Item) {
    if (this.isFull) {
      throw new InventoryFullError();
    }
    this.set(item.uuid, item);
  }

  /**
   * @param {Item} item
   */
  removeItem(item: Item) {
    this.delete(item.uuid);
  }

  serialize() {
    // Item is imported here to prevent circular dependency with Item having an Inventory
    const Item = require("./Item");

    let data = {
      items: [],
      max: this.maxSize,
    };

    for (const [uuid, item] of this) {
      if (!(item instanceof Item)) {
        this.delete(uuid);
        continue;
      }

      data.items.push([uuid, item.serialize()]);
    }

    return data;
  }

  /**
   * @param {GameState} state
   * @param {Character|Item} carriedBy
   */
  hydrate(state: IGameState, carriedBy: Player | Npc | Item) {
    // Item is imported here to prevent circular dependency with Item having an Inventory
    const Item = require("./Item");

    for (const [uuid, def] of this) {
      if (def instanceof Item) {
        def.carriedBy = carriedBy;
        continue;
      }

      if (!def.entityReference) {
        continue;
      }

      const area = state.AreaManager.getAreaByReference(def.entityReference);
      let newItem = state.ItemFactory.create(area, def.entityReference);
      newItem.uuid = uuid;
      newItem.carriedBy = carriedBy;
      newItem.initializeInventory(def.inventory);
      newItem.hydrate(state, def);
      this.set(uuid, newItem);
      state.ItemManager.add(newItem);
      /**
       * @event Item#spawn
       */
      newItem.emit('spawn', {type: Inventory});
    }
  }
}

/**
 * @extends Error
 */
export class InventoryFullError extends Error {}
