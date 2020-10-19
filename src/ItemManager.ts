import { Item } from './Item';
import { ItemType } from './ItemType';
import { Room } from './Room';

/**
 * Keep track of all items in game
 */
export class ItemManager {
	items: Set<Item>;
	constructor() {
		this.items = new Set();
	}

	add(item: Item) {
		this.items.add(item);
	}

	remove(item: Item) {
		if (item.room && item.room instanceof Room) {
			item.room.removeItem(item);
		}

		if (item.carriedBy) {
			item.carriedBy.removeItem(item);
		}

		if (item.type === ItemType.CONTAINER && item.inventory) {
			item.inventory.forEach((childItem: Item) => this.remove(childItem));
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
