import { EffectableEntity, ISerializedEffectableEntity } from './EffectableEntity';
import { IItemDef, Item } from './Item';
import { IInventoryDef, Inventory } from './Inventory';
import { Room } from './Room';
import { Party } from './Party';
import { EntityReference } from './EntityReference';
export interface ICharacterConfig extends ISerializedEffectableEntity {
    /** @property {string}     name       Name shown on look/who/login */
    name: string;
    /** @property {Inventory}  inventory */
    inventory: IInventoryDef;
    equipment?: Map<string, Item> | Record<string, {
        entityRefence: EntityReference;
    }>;
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
declare const Character_base: {
    new (...args: any[]): {
        metadata?: Record<string, any> | undefined;
        setMeta(key: string, value: any): void;
        getMeta(key: string): Record<string, any>;
        addListener(event: string | symbol, listener: (...args: any[]) => void): any;
        on(event: string | symbol, listener: (...args: any[]) => void): any;
        once(event: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
        off(event: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(event: string | symbol): Function[];
        rawListeners(event: string | symbol): Function[];
        emit(event: string | symbol, ...args: any[]): boolean;
        listenerCount(type: string | symbol): number;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
} & typeof EffectableEntity;
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
export declare class Character extends Character_base {
    /** @property {string}     name       Name shown on look/who/login */
    name: string;
    /** @property {Inventory}  inventory */
    inventory: Inventory;
    /** @property {Set}        combatants Enemies this character is currently in combat with */
    combatants: Set<Character>;
    /** @property {number}     level */
    equipment: Record<string, IItemDef> | Record<string, {
        entityRefence: EntityReference;
    }> | Map<string, Item>;
    level: number;
    /** @property {Room}       room       Room the character is currently in */
    room: Room | null;
    combatData: Record<string, unknown>;
    followers: Set<Character>;
    following: Character | null;
    party: Party | null;
    constructor(data: ICharacterConfig);
    /**
     * Start combat with a given target.
     * @param {Character} target
     * @param {?number}   lag    Optional milliseconds of lag to apply before the first attack
     * @fires Character#combatStart
     */
    initiateCombat(target: Character, lag?: number): void;
    /**
     * Check to see if this character is currently in combat or if they are
     * currently in combat with a specific character
     * @param {?Character} target
     * @return boolean
     */
    isInCombat(target?: Character): boolean;
    /**
     * @param {Character} target
     * @fires Character#combatantAdded
     */
    addCombatant(target: Character): void;
    /**
     * @param {Character} target
     * @fires Character#combatantRemoved
     * @fires Character#combatEnd
     */
    removeCombatant(target: Character): void;
    /**
     * Fully remove this character from combat
     */
    removeFromCombat(): void;
    /**
     * @param {Item} item
     * @param {string} slot Slot to equip the item in
     *
     * @throws EquipSlotTakenError
     * @throws EquipAlreadyEquippedError
     * @fires Character#equip
     * @fires Item#equip
     */
    equip(item: Item, slot: string): void;
    /**
     * Remove equipment in a given slot and move it to the character's inventory
     * @param {string} slot
     *
     * @throws InventoryFullError
     * @fires Item#unequip
     * @fires Character#unequip
     */
    unequip(slot: string): void;
    /**
     * Move an item to the character's inventory
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * Remove an item from the character's inventory. Warning: This does not automatically place the
     * item in any particular place. You will need to manually add it to the room or another
     * character's inventory
     * @param {Item} item
     */
    removeItem(item: Item): void;
    /**
     * Check to see if this character has a particular item by EntityReference
     * @param {EntityReference} itemReference
     * @return {Item|boolean}
     */
    hasItem(itemReference: string): Item | boolean;
    /**
     * @return {boolean}
     */
    isInventoryFull(): boolean;
    /**
     * @private
     */
    private _setupInventory;
    /**
     * Begin following another character. If the character follows itself they stop following.
     * @param {Character} target
     */
    follow(target: Character): void;
    /**
     * Stop following whoever the character was following
     * @fires Character#unfollowed
     */
    unfollow(): void;
    /**
     * @param {Character} follower
     * @fires Character#gainedFollower
     */
    addFollower(follower: Character): void;
    /**
     * @param {Character} follower
     * @fires Character#lostFollower
     */
    removeFollower(follower: Character): void;
    /**
     * @param {Character} target
     * @return {boolean}
     */
    isFollowing(target: Character): boolean;
    /**
     * @param {Character} target
     * @return {boolean}
     */
    hasFollower(target: Character): boolean;
    /**
     * Gather data to be persisted
     *
     * @return {Object}
     */
    serialize(): ISerializedCharacter;
    /**
     * @see {@link Broadcast}
     */
    getBroadcastTargets(): this[];
    /**
     * @return {boolean}
     */
    get isNpc(): boolean;
}
export {};
