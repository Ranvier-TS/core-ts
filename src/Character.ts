import { Damage } from "./Damage";
import { Item } from "./Item";
import { IInventoryDef, Inventory, InventoryFullError } from "./Inventory";
import { Logger } from "./Logger";
import { Metadatable } from "./Metadatable";
import { EventEmitter } from "events";
import { Room } from "./Room";
import { Attributes } from "./Attributes";
import { Config } from "./Config";
import { GameState } from "./GameState";

const EffectList = require("./EffectList");
const {
  EquipSlotTakenError,
  EquipAlreadyEquippedError,
} = require("./EquipErrors");

export interface ICharacterConfig {
  /** @property {string}     name       Name shown on look/who/login */
  name: string;
  /** @property {Inventory}  inventory */
  inventory: IInventoryDef;
  equipment: Map<string, Item>;
  /** @property {number}     level */
  level: number;
  /** @property {Room}       room       Room the character is currently in */
  room: Room;
  metadata: object;
}

export interface ISerializedCharacter {
  attributes: object;
  level: number;
  name: string;
  room: string;
  effects: string[];
}

/**
 * The Character class acts as the base for both NPCs and Players.
 *
 * @property {string}     name       Name shown on look/who/login
 * @property {Inventory}  inventory
 * @property {Set}        combatants Enemies this character is currently in combat with
 * @property {number}     level
 * @property {Attributes} attributes
 * @property {EffectList} effects    List of current effects applied to the character
 * @property {Room}       room       Room the character is currently in
 *
 * @extends EventEmitter
 * @mixes Metadatable
 */
export class Character extends Metadatable(EventEmitter) {
  /** @property {string}     name       Name shown on look/who/login */
  name: string;
  /** @property {Inventory}  inventory */
  inventory: Inventory;
  /** @property {Set}        combatants Enemies this character is currently in combat with */
  combatants: Set<any>;
  /** @property {number}     level */
  level: number;
  /** @property {EffectList} effects    List of current effects applied to the character */
  effects: EffectList;
  /** @property {Room}       room       Room the character is currently in */
  room: Room;

  constructor(data: ICharacterConfig) {
    super();

    this.name = data.name;
    this.inventory = new Inventory(data.inventory || {});
    this.equipment = data.equipment || new Map();
    this.combatants = new Set();
    this.combatData = {};
    this.level = data.level || 1;
    this.room = data.room || null;
    this.attributes = data.attributes || new Attributes();

    this.followers = new Set();
    this.following = null;
    this.party = null;

    this.effects = new EffectList(this, data.effects);

    // Arbitrary data bundles are free to shove whatever they want in
    // WARNING: values must be JSON.stringify-able
    if (data.metadata) {
      this.metadata = JSON.parse(JSON.stringify(data.metadata));
    } else {
      this.metadata = {};
    }
  }

  /**
   * Proxy all events on the player to effects
   * @param {string} event
   * @param {...*}   args
   */
  emit(event: string, ...args: any) {
    super.emit(event, ...args);

    this.effects.emit(event, ...args);
  }

  /**
   * @param {string} attrString Attribute name
   * @return {boolean}
   */
  hasAttribute(attrString: string) {
    return this.attributes.has(attrString);
  }

  /**
   * Get current maximum value of attribute (as modified by effects.)
   * @param {string} attr
   * @return {number}
   */
  getMaxAttribute(attrString: string) {
    if (!this.hasAttribute(attrString)) {
      throw new RangeError(`Character does not have attribute [${attrString}]`);
    }

    const attribute = this.attributes.get(attrString);
    const currentVal = this.effects.evaluateAttribute(attribute);

    if (!attribute.formula) {
      return currentVal;
    }

    const { formula } = attribute;

    const requiredValues = formula.requires.map((reqAttr: string) =>
      this.getMaxAttribute(reqAttr)
    );

    return formula.evaluate.apply(formula, [
      attribute,
      this,
      currentVal,
      ...requiredValues,
    ]);
  }

  /**
   * @see {@link Attributes#add}
   */
  addAttribute(attrString: string) {
    this.attributes.add(attrString);
  }

  /**
   * Get the current value of an attribute (base modified by delta)
   * @param {string} attrString
   * @return {number}
   */
  getAttribute(attrString: string) {
    if (!this.hasAttribute(attrString)) {
      throw new RangeError(`Character does not have attribute [${attrString}]`);
    }

    return (
      this.getMaxAttribute(attrString) + this.attributes.get(attrString).delta
    );
  }

  /**
   * Get the base value for a given attribute
   * @param {string} attrString Attribute name
   * @return {number}
   */
  getBaseAttribute(attrString: string) {
    const attribute = this.attributes.get(attrString);
    return attribute && attribute.base;
  }

  /**
   * Fired when a Character's attribute is set, raised, or lowered
   * @event Character#attributeUpdate
   * @param {string} attributeName
   * @param {Attribute} attribute
   */

  /**
   * Clears any changes to the attribute, setting it to its base value.
   * @param {string} attrString
   * @fires Character#attributeUpdate
   */
  setAttributeToMax(attrString: string) {
    if (!this.hasAttribute(attrString)) {
      throw new Error(`Invalid attribute ${attrString}`);
    }

    this.attributes.get(attrString).setDelta(0);
    this.emit("attributeUpdate", attrString, this.getAttribute(attrString));
  }

  /**
   * Raise an attribute by name
   * @param {string} attrString
   * @param {number} amount
   * @see {@link Attributes#raise}
   * @fires Character#attributeUpdate
   */
  raiseAttribute(attrString: string, amount: number) {
    if (!this.hasAttribute(attrString)) {
      throw new Error(`Invalid attribute ${attrString}`);
    }

    this.attributes.get(attrString).raise(amount);
    this.emit("attributeUpdate", attrString, this.getAttribute(attrString));
  }

  /**
   * Lower an attribute by name
   * @param {string} attrString
   * @param {number} amount
   * @see {@link Attributes#lower}
   * @fires Character#attributeUpdate
   */
  lowerAttribute(attrString: string, amount: number) {
    if (!this.hasAttribute(attrString)) {
      throw new Error(`Invalid attribute ${attrString}`);
    }

    this.attributes.get(attrString).lower(amount);
    this.emit("attributeUpdate", attrString, this.getAttribute(attrString));
  }

  /**
   * Update an attribute's base value.
   *
   * NOTE: You _probably_ don't want to use this the way you think you do. You should not use this
   * for any temporary modifications to an attribute, instead you should use an Effect modifier.
   *
   * This will _permanently_ update the base value for an attribute to be used for things like a
   * player purchasing a permanent upgrade or increasing a stat on level up
   *
   * @param {string} attrString Attribute name
   * @param {number} newBase New base value
   * @fires Character#attributeUpdate
   */
  setAttributeBase(attrString: string, newBase: number) {
    if (!this.hasAttribute(attrString)) {
      throw new Error(`Invalid attribute ${attrString}`);
    }

    this.attributes.get(attrString).setBase(newBase);
    this.emit("attributeUpdate", attrString, this.getAttribute(attrString));
  }

  /**
   * @param {string} type
   * @return {boolean}
   * @see {@link Effect}
   */
  hasEffectType(type: string) {
    return this.effects.hasEffectType(type);
  }

  /**
   * @param {Effect} effect
   * @return {boolean}
   */
  addEffect(effect: Effect) {
    return this.effects.add(effect);
  }

  /**
   * @param {Effect} effect
   * @see {@link Effect#remove}
   */
  removeEffect(effect: Effect) {
    this.effects.remove(effect);
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
      this.emit("combatStart");
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
    this.emit("combatantAdded", target);
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
    this.emit("combatantRemoved", target);

    if (!this.combatants.size) {
      /**
       * @event Character#combatEnd
       */
      this.emit("combatEnd");
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
   * @see EffectList.evaluateIncomingDamage
   * @param {Damage} damage
   * @return {number}
   */
  evaluateIncomingDamage(damage: Damage, currentAmount: number) {
    let amount = this.effects.evaluateIncomingDamage(damage, currentAmount);
    return Math.floor(amount);
  }

  /**
   * @see EffectList.evaluateOutgoingDamage
   * @param {Damage} damage
   * @param {number} currentAmount
   * @return {number}
   */
  evaluateOutgoingDamage(damage: Damage, currentAmount: number) {
    return this.effects.evaluateOutgoingDamage(damage, currentAmount);
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
    item.emit("equip", this);
    /**
     * @event Character#equip
     * @param {string} slot
     * @param {Item} item
     */
    this.emit("equip", slot, item);
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
    if (this.isInventoryFull()) {
      throw new InventoryFullError();
    }

    const item = this.equipment.get(slot);
    item.isEquipped = false;
    item.equippedBy = null;
    this.equipment.delete(slot);
    /**
     * @event Item#unequip
     * @param {Character} equipper
     */
    item.emit("unequip", this);
    /**
     * @event Character#unequip
     * @param {string} slot
     * @param {Item} item
     */
    this.emit("unequip", slot, item);
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

    // if we removed the last item unset the inventory
    // This ensures that when it's reloaded it won't try to set
    // its default inventory. Instead it will persist the fact
    // that all the items were removed from it
    if (!this.inventory.size) {
      this.inventory = null;
    }
    item.carriedBy = null;
  }

  /**
   * Check to see if this character has a particular item by EntityReference
   * @param {EntityReference} itemReference
   * @return {Item|boolean}
   */
  hasItem(itemReference: string): Item | boolean {
    for (const [uuid, item] of this.inventory) {
      if (item.entityReference === itemReference) {
        return item;
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
      this.inventory.setMax(Config.get("defaultMaxPlayerInventory", 20));
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
    this.emit("followed", target);
  }

  /**
   * Stop following whoever the character was following
   * @fires Character#unfollowed
   */
  unfollow() {
    this.following.removeFollower(this);
    /**
     * @event Character#unfollowed
     * @param {Character} following
     */
    this.emit("unfollowed", this.following);
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
    this.emit("gainedFollower", follower);
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
    this.emit("lostFollower", follower);
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
   * Initialize the character from storage
   * @param {GameState} state
   */
  hydrate(state: GameState) {
    if (this.__hydrated) {
      Logger.warn("Attempted to hydrate already hydrated character.");
      return false;
    }

    if (!(this.attributes instanceof Attributes)) {
      const attributes = this.attributes;
      this.attributes = new Attributes();

      for (const attr in attributes) {
        let attrConfig = attributes[attr];
        if (typeof attrConfig === "number") {
          attrConfig = { base: attrConfig };
        }

        if (typeof attrConfig !== "object" || !("base" in attrConfig)) {
          throw new Error(
            "Invalid base value given to attributes.\n" +
              JSON.stringify(attributes, null, 2)
          );
        }

        if (!state.AttributeFactory.has(attr)) {
          throw new Error(
            `Entity trying to hydrate with invalid attribute ${attr}`
          );
        }

        this.addAttribute(
          state.AttributeFactory.create(
            attr,
            attrConfig.base,
            attrConfig.delta || 0
          )
        );
      }
    }

    this.effects.hydrate(state);

    // inventory is hydrated in the subclasses because npc and players hydrate their inventories differently

    this.__hydrated = true;
  }

  /**
   * Gather data to be persisted
   * @return {Object}
   */
  serialize(): ISerializedCharacter {
    return {
      attributes: this.attributes.serialize(),
      level: this.level,
      name: this.name,
      room: this.room.entityReference,
      effects: this.effects.serialize(),
    };
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
