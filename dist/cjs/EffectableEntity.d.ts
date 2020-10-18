/// <reference types="node" />
import { EventEmitter } from 'events';
import { Attribute, ISerializedAttribute } from './Attribute';
import { Attributes } from './Attributes';
import { Damage } from './Damage';
import { Effect, ISerializedEffect } from './Effect';
import { EffectList } from './EffectList';
import { PlayerOrNpc } from './GameEntity';
import { IGameState } from './GameState';
export interface ISerializedEffectableEntity {
    attributes: SerializedAttributes;
    effects: ISerializedEffect[];
}
export declare type SerializedAttributes = Record<string, ISerializedAttribute>;
/**
 * @ignore
 * @exports MetadatableFn
 * @param {*} parentClass
 * @return {module:MetadatableFn~Metadatable}
 * Base class for game entities that can have effects/attributes
 * @extends EventEmitter
 */
export declare class EffectableEntity extends EventEmitter {
    effects: EffectList;
    attributes: Attributes;
    readonly __attributes: SerializedAttributes;
    __hydrated: boolean;
    constructor(data: Partial<ISerializedEffectableEntity>);
    /**
     * Proxy all events on the entity to effects
     * @param {string} event
     * @param {...*}   args
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * @param {string} attr Attribute name
     * @return {boolean}
     */
    hasAttribute(attr: string): boolean;
    /**
     * Get current maximum value of attribute (as modified by effects.)
     * @param {string} attr
     * @return {number}
     */
    getMaxAttribute(attrString: string): number;
    /**
     * @see {@link Attributes#add}
     */
    addAttribute(attr: Attribute): void;
    /**
     * Get the current value of an attribute (base modified by delta)
     * @param {string} attrString
     * @return {number}
     */
    getAttribute(attrName: string): number;
    /**
     * Get the effected value of a given property
     * @param {string} propertyName
     * @return {*}
     */
    getProperty(propertyName: string): number;
    /**
     * Get the base value for a given attribute
     * @param {string} attrName Attribute name
     * @return {number}
     */
    getBaseAttribute(attrName: string): number | undefined;
    /**
     * Fired when an Entity's attribute is set, raised, or lowered
     * @event EffectableEntity#attributeUpdate
     * @param {string} attributeName
     * @param {Attribute} attribute
     */
    /**
     * Clears any changes to the attribute, setting it to its base value.
     * @param {string} attrString
     * @fires EffectableEntity#attributeUpdate
     */
    setAttributeToMax(attrString: string): void;
    /**
     * Raise an attribute by name
     * @param {string} attr
     * @param {number} amount
     * @see {@link Attributes#raise}
     * @fires EffectableEntity#attributeUpdate
     */
    raiseAttribute(attrString: string, amount: number): void;
    /**
     * Lower an attribute by name
     * @param {string} attr
     * @param {number} amount
     * @see {@link Attributes#lower}
     * @fires EffectableEntity#attributeUpdate
     */
    lowerAttribute(attrString: string, amount: number): void;
    /**
     * Update an attribute's base value.
     *
     * NOTE: You _probably_ don't want to use this the way you think you do. You should not use this
     * for any temporary modifications to an attribute, instead you should use an Effect modifier.
     *
     * This will _permanently_ update the base value for an attribute to be used for things like a
     * player purchasing a permanent upgrade or increasing a stat on level up
     *
     * @param {string} attr Attribute name
     * @param {number} newBase New base value
     * @fires EffectableEntity#attributeUpdate
     */
    setAttributeBase(attrString: string, newBase: number): void;
    /**
     * @param {string} type
     * @return {boolean}
     * @see {@link Effect}
     */
    hasEffectType(type: string): boolean;
    /**
     * @param {Effect} effect
     * @return {boolean}
     */
    addEffect(effect: Effect): boolean;
    /**
     * @param {Effect} effect
     * @see {@link Effect#remove}
     */
    removeEffect(effect: Effect): void;
    /**
     * @see EffectList.evaluateIncomingDamage
     * @param {Damage} damage
   * @param {number} currentAmount
     * @param {?Character} attacker
     * @return {number}
     */
    evaluateIncomingDamage(damage: Damage, currentAmount: number, attacker?: PlayerOrNpc): number;
    /**
     * @see EffectList.evaluateOutgoingDamage
     * @param {Damage} damage
     * @param {number} currentAmount
     * @param {Character} target
     * @return {number}
     */
    evaluateOutgoingDamage(damage: Damage, currentAmount: number, target: PlayerOrNpc): number;
    /**
     * Initialize the entity from storage
     * @param {GameState} state
     */
    hydrate(state: IGameState, serialized?: {}): void;
    /**
     * Gather data to be persisted
     * @return {Object}
     */
    serialize(): {
        attributes: Record<string, ISerializedAttribute>;
        effects: ISerializedEffect[];
    };
}
