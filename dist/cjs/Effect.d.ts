/// <reference types="node" />
import { EventEmitter } from 'events';
import { Damage } from './Damage';
import { EffectableEntity } from './EffectableEntity';
import { IGameState } from './GameState';
import { Skill } from './Skill';
import { EventListeners } from './EventManager';
import { PlayerOrNpc } from './GameEntity';
/** @typedef EffectModifiers {{attributes: !Object<string,function>}} */
export declare type EffectModifiers = {
    attributes: Record<string, (...args: any[]) => any>;
    incomingDamage: (damage: Damage, currentAmount: number, attacker?: PlayerOrNpc) => any;
    outgoingDamage: (damage: Damage, currentAmount: number, target: PlayerOrNpc) => any;
    properties: (...args: any[]) => any | Record<string, (...args: any[]) => any>;
};
export interface IEffectDef {
    /** @property {EffectConfig}  config Effect configuration (name/desc/duration/etc.) */
    config: IEffectConfig;
    elapsed?: number;
    flags?: string[];
    skill?: string;
    /** @property {EffectModifiers} modifiers Attribute modifier functions */
    modifiers?: EffectModifiers;
    state?: Partial<IEffectState>;
    listeners?: EventListeners;
}
export interface ISerializedEffect {
    config: IEffectConfig;
    elapsed: number | null;
    id: string;
    remaining: number;
    skill?: string;
    state: IEffectState;
}
export interface IEffectState {
    stacks: number;
    maxStacks: number;
    ticks: number;
    lastTick: number;
    cooldownId: null | string;
    [key: string]: unknown;
}
export interface IEffectConfig {
    /** @property {boolean} autoActivate If this effect immediately activates itself when added to the target */
    autoActivate?: boolean;
    /** @property {boolean} hidden       If this effect is shown in the character's effect list */
    hidden?: boolean;
    /** @property {boolean} refreshes    If an effect with the same type is applied it will trigger an effectRefresh  event instead of applying the additional effect. */
    refreshes?: boolean;
    /** @property {boolean} unique       If multiple effects with the same `config.type` can be applied at once */
    unique?: boolean;
    /** @property {number}  maxStacks    When adding an effect of the same type it adds a stack to the current */
    /**     effect up to maxStacks instead of adding the effect. Implies `config.unique` */
    maxStacks?: number;
    /** @property {boolean} persists     If false the effect will not save to the player */
    persists?: boolean;
    /** @property {string}  type         The effect category, mainly used when disallowing stacking */
    type?: string;
    /** @property {boolean|number} tickInterval Number of seconds between calls to the `updateTick` listener */
    tickInterval?: boolean | number;
    /** @property {string}    name */
    name?: string;
    /** @property {string}    description */
    description?: string;
    /** @property {number}    duration    Total duration of effect in _milliseconds_ */
    duration?: number;
    /** @property {number}    elapsed     Get elapsed time in _milliseconds_ */
    elapsed?: number;
    paused?: number;
}
/**
 * See the {@link http://ranviermud.com/extending/effects/|Effect guide} for usage.
 * @property {object}  config Effect configuration (name/desc/duration/etc.)
 * @property {boolean} config.autoActivate If this effect immediately activates itself when added to the target
 * @property {boolean} config.hidden       If this effect is shown in the character's effect list
 * @property {boolean} config.refreshes    If an effect with the same type is applied it will trigger an effectRefresh
 *   event instead of applying the additional effect.
 * @property {boolean} config.unique       If multiple effects with the same `config.type` can be applied at once
 * @property {number}  config.maxStacks    When adding an effect of the same type it adds a stack to the current
 *     effect up to maxStacks instead of adding the effect. Implies `config.unique`
 * @property {boolean} config.persists     If false the effect will not save to the player
 * @property {string}  config.type         The effect category, mainly used when disallowing stacking
 * @property {boolean|number} config.tickInterval Number of seconds between calls to the `updateTick` listener
 * @property {string}    description
 * @property {number}    duration    Total duration of effect in _milliseconds_
 * @property {number}    elapsed     Get elapsed time in _milliseconds_
 * @property {string}    id     filename minus .js
 * @property {EffectModifiers} modifiers Attribute modifier functions
 * @property {string}    name
 * @property {number}    remaining Number of seconds remaining
 * @property {number}    startedAt Date.now() time this effect became active
 * @property {object}    state  Configuration of this _type_ of effect (magnitude, element, stat, etc.)
 * @property {Character} target Character this effect is... effecting
 * @extends EventEmitter
 *
 * @listens Effect#effectAdded
 */
export declare class Effect extends EventEmitter {
    /** @property {string}    id     filename minus .js */
    id: string;
    /** @property {EffectConfig}  config Effect configuration (name/desc/duration/etc.) */
    config: IEffectConfig;
    /** @property {number}    startedAt Date.now() time this effect became active */
    startedAt: number;
    /** @property {object}    state  Configuration of this _type_ of effect (magnitude, element, stat, etc.) */
    state: IEffectState;
    /** @property {Character} target Character this effect is... effecting */
    target?: EffectableEntity;
    flags: string[];
    paused: number;
    /** @property {EffectModifiers} modifiers Attribute modifier functions */
    modifiers: EffectModifiers;
    active?: boolean;
    skill?: Skill | string;
    constructor(id: string, def: IEffectDef);
    /**
     * @type {string}
     */
    get name(): string | undefined;
    /**
     * @type {string}
     */
    get description(): string | undefined;
    /**
     * @type {number}
     */
    get duration(): number | undefined;
    set duration(dur: number | undefined);
    /**
     * Elapsed time in milliseconds since event was activated
     * @type {number}
     */
    get elapsed(): number;
    /**
     * Remaining time in seconds
     * @type {number}
     */
    get remaining(): number;
    /**
     * Whether this effect has lapsed
     * @return {boolean}
     */
    isCurrent(): boolean;
    /**
     * Set this effect active
     * @fires Effect#effectActivated
     */
    activate(): void;
    /**
     * Deactivate this effect
     * @fires Effect#effectDeactivated
     */
    deactivate(): void;
    /**
     * Remove this effect from its target
     * @fires Effect#remove
     */
    remove(): void;
    /**
     * Stop this effect from having any effect temporarily
     */
    pause(): void;
    /**
     * Resume a paused effect
     */
    resume(): void;
    /**
     * Apply effect attribute modifiers to a given value
     *
     * @param {string} attrName
     * @param {number} currentValue
     * @return {number} attribute value modified by effect
     */
    modifyAttribute(attrName: string, currentValue: number): any;
    /**
     * Apply effect property modifiers to a given value
     *
     * @param {string} propertyName
     * @param {number} currentValue
     * @return {*} property value modified by effect
     */
    modifyProperty(propertyName: string, currentValue: number): any;
    /**
     * @param {Damage} damage
     * @param {number} currentAmount
     * @param {?Character} attacker
     * @return {Damage}
     */
    modifyIncomingDamage(damage: Damage, currentAmount: number, attacker?: PlayerOrNpc): any;
    /**
     * @param {Damage} damage
     * @param {number} currentAmount
     * @param {Character} target
     * @return {Damage}
     */
    modifyOutgoingDamage(damage: Damage, currentAmount: number, target: PlayerOrNpc): any;
    /**
     * Gather data to persist
     * @return {Object}
     */
    serialize(): ISerializedEffect;
    /**
     * Reinitialize from persisted data
     * @param {GameState}
     * @param {Object} data
     */
    hydrate(state: IGameState, data: ISerializedEffect): void;
}
