import { Attribute } from './Attribute';
import { Damage } from './Damage';
import { Effect, ISerializedEffect } from './Effect';
import { EffectableEntity } from './EffectableEntity';
import { PlayerOrNpc } from './GameEntity';
import { IGameState } from './GameState';
/**
 * Self-managing list of effects for a target
 * @property {Set}    effects
 * @property {number} size Number of currently active effects
 * @property {Character} target
 */
export declare class EffectList {
    target: EffectableEntity;
    effects: Set<Effect>;
    private readonly __effects;
    /**
     * @param {GameEntity} target
     * @param {Array<Object|Effect>} effects array of serialized effects (Object) or actual Effect instances
     */
    constructor(target: EffectableEntity, effects: ISerializedEffect[]);
    /**
     * @type {number}
     */
    get size(): number;
    /**
     * Get current list of effects as an array
     * @return {Array<Effect>}
     */
    entries(): Effect[];
    /**
     * @param {string} type
     * @return {boolean}
     */
    hasEffectType(type: string): boolean;
    /**
     * @param {string} type
     * @return {Effect}
     */
    getByType(type: string): Effect | undefined;
    /**
     * Proxy an event to all effects
     * @param {string} event
     * @param {...*}   args
     */
    emit(event: string, ...args: any[]): void;
    /**
     * @param {Effect} effect
     * @fires Effect#effectAdded
     * @fires Effect#effectStackAdded
     * @fires Effect#effectRefreshed
     * @fires Character#effectAdded
     */
    add(effect: Effect): boolean;
    /**
     * Deactivate and remove an effect
     * @param {Effect} effect
     * @throws ReferenceError
     * @fires Character#effectRemoved
     */
    remove(effect: Effect): void;
    /**
     * Remove all effects, bypassing all deactivate and remove events
     */
    clear(): void;
    /**
     * Ensure effects are still current and if not remove them
     */
    validateEffects(): void;
    /**
     * Gets the effective "max" value of an attribute (before subtracting delta).
     * Does the work of actaully applying attribute modification
     * @param {Atrribute} attr
     * @return {number}
     */
    evaluateAttribute(attr: Attribute): number;
    /**
     * Gets the effective value of property doing all effect modifications.
     * @param {string} propertyName
     * @return {number}
     */
    evaluateProperty(propertyName: string, propertyValue: number): number;
    /**
     * @param {Damage} damage
     * @param {number} currentAmount
     * @param {?Character} attacker
     * @return {number}
     */
    evaluateIncomingDamage(damage: Damage, currentAmount: number, attacker?: PlayerOrNpc): number;
    /**
     * @param {Damage} damage
     * @param {number} currentAmount
     * @param {Character} target
     * @return {number}
     */
    evaluateOutgoingDamage(damage: Damage, currentAmount: number, target: PlayerOrNpc): number;
    serialize(): ISerializedEffect[];
    hydrate(state: IGameState): void;
}
