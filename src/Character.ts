import {
	EffectableEntity,
	ISerializedEffectableEntity,
} from './EffectableEntity';
import { IItemDef, Item } from './Item';
import { IInventoryDef, Inventory, InventoryFullError } from './Inventory';
import { Metadatable } from './Metadatable';
import { Room } from './Room';
import { Config } from './Config';
import { Party } from './Party';
import { EquipSlotTakenError, EquipAlreadyEquippedError } from './EquipErrors';
import { EntityReference } from './EntityReference';
import { Equipment } from './Equipment';
import { AnyCharacter } from './GameEntity';

export interface ICharacterConfig extends ISerializedEffectableEntity {
	/** @property {string}     name       Name shown on look/who/login */
	name: string;
	/** @property {Inventory}  inventory */
	inventory: IInventoryDef;
	equipment?:
		| Record<string, IItemDef>
		| Record<string, { entityReference: EntityReference }>;
	/** @property {number}     level */
	level: number;
	/** @property {Room}       room       Room the character is currently in */
	room: Room;
	metadata: object;
}

export interface ISerializedCharacter extends ISerializedEffectableEntity {
	level: number;
	name: string;
	room: string;
}

/**
 * The Character class acts as the base for both NPCs and Players.
 *
 * @property {string}     name       Name shown on look/who/login
 * @property {Inventory}  inventory
 * @property {Set}        combatants Enemies this character is currently in combat with
 * @property {number}     level
 * @property {EffectList} effects    List of current effects applied to the character
 * @property {Room}       room       Room the character is currently in
 *
 * @extends EffectableEntity
 * @mixes Metadatable
 */
export class Character extends Metadatable(EffectableEntity) {
	/** @property {string}     name       Name shown on look/who/login */
	name: string;
	/** @property {Inventory}  inventory */
	inventory: Inventory;
	/** @property {Set}        combatants Enemies this character is currently in combat with */
	combatants: Set<Character>;
	/** @property {number}     level */
	__equipment?:
		| Record<string, IItemDef>
		| Record<string, { entityReference: EntityReference }>;
	equipment: Equipment;

	level: number;
	/** @property {Room}       room       Room the character is currently in */
	room: Room | null;

	combatData: Record<string, unknown>;

	followers: Set<Character>;
	following: Character | null;
	party: Party | null;

	constructor(data: ICharacterConfig) {
		super(data);

		this.name = data.name;
		this.inventory = new Inventory(data.inventory || {});
		this.__equipment = data.equipment;
		this.equipment = new Map();
		this.combatants = new Set();
		this.combatData = {};
		this.level = data.level || 1;
		this.room = data.room || null;

		this.followers = new Set();
		this.following = null;
		this.party = null;

		// Arbitrary data bundles are free to shove whatever they want in
		// WARNING: values must be JSON.stringify-able
		if (data.metadata) {
			this.metadata = JSON.parse(JSON.stringify(data.metadata));
		} else {
			this.metadata = {};
		}
	}

	/**
	 * Start combat with a given target.
	 * @param {Character} target
	 * @param {?number}   lag    Optional milliseconds of lag to apply before the first attack
	 * @fires Character#combatStart
	 */
	initiateCombat(target: Character, lag: number = 0) {
		if (!this.isInCombat()) {
			this.combatData.lag = lag;
			this.combatData.roundStarted = Date.now();
			/**
			 * Fired when Character#initiateCombat is called
			 * @event Character#combatStart
			 */
			this.emit('combatStart');
		}

		if (this.isInCombat(target)) {
			return;
		}

		// this doesn't use `addCombatant` because `addCombatant` automatically
		// adds this to the target's combatants list as well
		this.combatants.add(target);
		if (!target.isInCombat()) {
			// TODO: This hardcoded 2.5 second lag on the target needs to be refactored
			target.initiateCombat(this, 2500);
		}

		target.addCombatant(this);
	}

	/**
	 * Check to see if this character is currently in combat or if they are
	 * currently in combat with a specific character
	 * @param {?Character} target
	 * @return boolean
	 */
	isInCombat(target?: Character) {
		return target ? this.combatants.has(target) : this.combatants.size > 0;
	}

	/**
	 * @param {Character} target
	 * @fires Character#combatantAdded
	 */
	addCombatant(target: Character) {
		if (this.isInCombat(target)) {
			return;
		}

		this.combatants.add(target);
		target.addCombatant(this);
		/**
		 * @event Character#combatantAdded
		 * @param {Character} target
		 */
		this.emit('combatantAdded', target);
	}

	/**
	 * @param {Character} target
	 * @fires Character#combatantRemoved
	 * @fires Character#combatEnd
	 */
	removeCombatant(target: Character) {
		if (!this.combatants.has(target)) {
			return;
		}

		this.combatants.delete(target);
		target.removeCombatant(this);

		/**
		 * @event Character#combatantRemoved
		 * @param {Character} target
		 */
		this.emit('combatantRemoved', target);

		if (!this.combatants.size) {
			/**
			 * @event Character#combatEnd
			 */
			this.emit('combatEnd');
		}
	}

	/**
	 * Fully remove this character from combat
	 */
	removeFromCombat() {
		if (!this.isInCombat()) {
			return;
		}

		for (const combatant of this.combatants) {
			this.removeCombatant(combatant);
		}
	}

	/**
	 * @param {Item} item
	 * @param {string} slot Slot to equip the item in
	 *
	 * @throws EquipSlotTakenError
	 * @throws EquipAlreadyEquippedError
	 * @fires Character#equip
	 * @fires Item#equip
	 */
	equip(item: Item, slot: string) {
		if (!(this.equipment instanceof Map)) {
			throw new Error(`Character ${this.name} equipment is not hydrated.`);
		}

		if (this.equipment.has(slot)) {
			throw new EquipSlotTakenError();
		}

		if (item.isEquipped) {
			throw new EquipAlreadyEquippedError();
		}

		if (this.inventory) {
			this.removeItem(item);
		}

		this.equipment.set(slot, item);
		item.isEquipped = true;
		item.equippedBy = this;
		/**
		 * @event Item#equip
		 * @param {Character} equipper
		 */
		item.emit('equip', this);
		/**
		 * @event Character#equip
		 * @param {string} slot
		 * @param {Item} item
		 */
		this.emit('equip', slot, item);
	}

	/**
	 * Remove equipment in a given slot and move it to the character's inventory
	 * @param {string} slot
	 *
	 * @throws InventoryFullError
	 * @fires Item#unequip
	 * @fires Character#unequip
	 */
	unequip(slot: string) {
		if (!(this.equipment instanceof Map)) {
			throw new Error(`Character ${this.name} equipment is not hydrated.`);
		}

		if (this.isInventoryFull()) {
			throw new InventoryFullError();
		}

		const item = this.equipment.get(slot);
		if (!item) {
			throw new EquipAlreadyEquippedError(`Slot ${slot} already unequipped.`);
		}

		item.isEquipped = false;
		item.equippedBy = null;
		this.equipment.delete(slot);
		/**
		 * @event Item#unequip
		 * @param {Character} equipper
		 */
		item.emit('unequip', this);
		/**
		 * @event Character#unequip
		 * @param {string} slot
		 * @param {Item} item
		 */
		this.emit('unequip', slot, item);
		this.addItem(item);
	}

	/**
	 * Move an item to the character's inventory
	 * @param {Item} item
	 */
	addItem(item: Item) {
		this._setupInventory();
		this.inventory.addItem(item);
		item.carriedBy = this;
	}

	/**
	 * Remove an item from the character's inventory. Warning: This does not automatically place the
	 * item in any particular place. You will need to manually add it to the room or another
	 * character's inventory
	 * @param {Item} item
	 */
	removeItem(item: Item) {
		this.inventory.removeItem(item);
		item.carriedBy = null;
	}

	/**
	 * Check to see if this character has a particular item by EntityReference
	 * @param {EntityReference} itemReference
	 * @return {Item|boolean}
	 */
	hasItem(itemReference: string): Item | boolean {
		if (!this.inventory.__hydated) {
			return false;
		}

		for (const [uuid, item] of this.inventory) {
			if (item.entityReference === itemReference) {
				return item as Item;
			}
		}

		return false;
	}

	/**
	 * @return {boolean}
	 */
	isInventoryFull() {
		this._setupInventory();
		return this.inventory.isFull;
	}

	/**
	 * @private
	 */
	private _setupInventory() {
		this.inventory = this.inventory || new Inventory();
		// Default max inventory size config
		if (!this.isNpc && !isFinite(this.inventory.getMax())) {
			this.inventory.setMax(Config.get('defaultMaxPlayerInventory', 20));
		}
	}

	/**
	 * Begin following another character. If the character follows itself they stop following.
	 * @param {Character} target
	 */
	follow(target: Character) {
		if (target === this) {
			this.unfollow();
			return;
		}

		this.following = target;
		target.addFollower(this);
		/**
		 * @event Character#followed
		 * @param {Character} target
		 */
		this.emit('followed', target);
	}

	/**
	 * Stop following whoever the character was following
	 * @fires Character#unfollowed
	 */
	unfollow() {
		if (!this.following) {
			return;
		}

		this.following.removeFollower(this);
		/**
		 * @event Character#unfollowed
		 * @param {Character} following
		 */
		this.emit('unfollowed', this.following);
		this.following = null;
	}

	/**
	 * @param {Character} follower
	 * @fires Character#gainedFollower
	 */
	addFollower(follower: Character) {
		this.followers.add(follower);
		follower.following = this;
		/**
		 * @event Character#gainedFollower
		 * @param {Character} follower
		 */
		this.emit('gainedFollower', follower);
	}

	/**
	 * @param {Character} follower
	 * @fires Character#lostFollower
	 */
	removeFollower(follower: Character) {
		this.followers.delete(follower);
		follower.following = null;
		/**
		 * @event Character#lostFollower
		 * @param {Character} follower
		 */
		this.emit('lostFollower', follower);
	}

	/**
	 * @param {Character} target
	 * @return {boolean}
	 */
	isFollowing(target: Character) {
		return this.following === target;
	}

	/**
	 * @param {Character} target
	 * @return {boolean}
	 */
	hasFollower(target: Character) {
		return this.followers.has(target);
	}

	/**
	 * Gather data to be persisted
	 *
	 * @return {Object}
	 */
	serialize(): ISerializedCharacter {
		return Object.assign(super.serialize(), {
			level: this.level,
			name: this.name,
			room: this.room?.entityReference || 'void',
		});
	}

	/**
	 * @see {@link Broadcast}
	 */
	getBroadcastTargets() {
		return [this];
	}

	/**
	 * @return {boolean}
	 */
	get isNpc() {
		return false;
	}
}
