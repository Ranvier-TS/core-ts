import { IGameState } from './GameState';
import { Item, IItemDef, ISerializedItem } from './Item';
import { Npc } from './Npc';
import { Player } from './Player';

export interface IInventoryDef {
	items?: [string, IItemDef][];
	max?: number;
}

export interface ISerializedInventory {
	items?: [string, ISerializedItem][];
	max?: number;
}

export type InventoryEntityType = Npc | Player | Item;
/**
 * Representation of a `Character` or container `Item` inventory
 * @extends Map
 */
export class Inventory extends Map<string, Item> {
	maxSize: number;
	__hydated: boolean;
	private readonly __items: [string, IItemDef][];
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

		super();
		this.__items = init.items || [];
		this.maxSize = init.max || Infinity;
		this.__hydated = false;
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
		const data: {
			items: [string, ISerializedItem][];
			max: number;
		} = {
			items: [],
			max: this.maxSize,
		};

		for (const [uuid, item] of this) {
			if (!(item instanceof Item)) {
				this.delete(uuid);
				continue;
			}

			data.items.push([uuid, (item as Item).serialize()]);
		}

		return data;
	}

	/**
	 * @param {GameState} state
	 * @param {Character|Item} carriedBy
	 */
	hydrate(state: IGameState, carriedBy: InventoryEntityType) {
		for (const [uuid, def] of this.__items) {
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
			newItem.initializeInventoryFromSerialized(def.inventory || {});
			newItem.hydrate(state, def);
			this.set(uuid, newItem);
			state.ItemManager.add(newItem);
			/**
			 * @event Item#spawn
			 */
			newItem.emit('spawn', { type: Inventory });
		}
		this.__hydated = true;
	}
}

/**
 * @extends Error
 */
export class InventoryFullError extends Error {}
