import { EventEmitter } from 'events';
import { Damage } from './Damage';
import { EffectableEntity } from './EffectableEntity';
import { IGameState } from './GameState';
import { Skill } from './Skill';
import { EventListeners } from './EventManager';
import { PlayerOrNpc } from './GameEntity';
import { Character } from './Character';

export type AttributesModifier =
	| Record<string, (this: Effect, current: number, ...args: any[]) => any>
	| ((this: Effect, attrName: string, current: number) => any)

/** @typedef EffectModifiers {{attributes: !Object<string,function>}} */
export type EffectModifiers = {
	attributes: AttributesModifier;
	incomingDamage: (
		damage: Damage,
		currentAmount: number,
		attacker?: PlayerOrNpc
	) => any;
	outgoingDamage: (
		damage: Damage,
		currentAmount: number,
		target: PlayerOrNpc
	) => any;
	properties: AttributesModifier;
};

export interface IEffectDef {
	/** @property {EffectConfig}  config Effect configuration (name/desc/duration/etc.) */
	config: IEffectConfig;
	elapsed?: number;
	flags?: string[];
	skill?: string;
	/** @property {EffectModifiers} modifiers Attribute modifier functions */
	modifiers?: Partial<EffectModifiers>;
	state?: Partial<IEffectState>;
	listeners?: EventListeners<Effect>;
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
export class Effect extends EventEmitter {
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

	constructor(id: string, def: IEffectDef) {
		super();

		this.id = id;
		this.flags = def.flags || [];
		this.config = Object.assign(
			{
				autoActivate: true,
				description: '',
				duration: Infinity,
				hidden: false,
				maxStacks: 0,
				name: 'Unnamed Effect',
				persists: true,
				refreshes: false,
				tickInterval: false,
				type: 'undef',
				unique: true,
				elapsed: 0,
				paused: 0,
			},
			def.config
		);

		this.startedAt = 0;
		this.paused = 0;
		this.modifiers = Object.assign(
			{
				attributes: {},
				incomingDamage: (_damage: Damage, current: number) => current,
				outgoingDamage: (_damage: Damage, current: number) => current,
				properties: {},
			} as EffectModifiers,
			def.modifiers
		);

		// internal state saved across player load e.g., stacks, amount of damage shield remaining, whatever
		// Default state can be found in config.state
		this.state = Object.assign(
			{
				stacks: 0,
				maxStacks: 0,
				ticks: 0,
				lastTick: -Infinity,
				cooldownId: null,
			},
			def.state
		);

		if (this.config.maxStacks) {
			this.state.stacks = 1;
		}

		// If an effect has a tickInterval it should always apply when first activated
		if (this.config.tickInterval && !this.state.tickInterval) {
			this.state.lastTick = -Infinity;
			this.state.ticks = 0;
		}

		if (this.config.autoActivate) {
			this.on('effectAdded', this.activate);
		}
	}

	/**
	 * @type {string}
	 */
	get name() {
		return this.config.name;
	}

	/**
	 * @type {string}
	 */
	get description() {
		return this.config.description;
	}

	/**
	 * @type {number}
	 */
	get duration() {
		return this.config.duration;
	}

	set duration(dur) {
		this.config.duration = dur;
	}

	/**
	 * Elapsed time in milliseconds since event was activated
	 * @type {number}
	 */
	get elapsed() {
		if (!this.startedAt) {
			return 0;
		}

		return this.paused || Date.now() - this.startedAt;
	}

	/**
	 * Remaining time in seconds
	 * @type {number}
	 */
	get remaining() {
		return (this.config.duration as number) - this.elapsed;
	}

	/**
	 * Whether this effect has lapsed
	 * @return {boolean}
	 */
	isCurrent() {
		return this.elapsed < (this.config.duration as number);
	}

	/**
	 * Set this effect active
	 * @fires Effect#effectActivated
	 */
	activate() {
		if (!this.target) {
			throw new Error('Cannot activate an effect without a target');
		}

		if (this.active) {
			return;
		}

		this.startedAt = Date.now() - (this.elapsed || 0);
		this.active = true;

		/**
		 * @event Effect#effectActivated
		 */
		this.emit('effectActivated');
	}

	/**
	 * Deactivate this effect
	 * @fires Effect#effectDeactivated
	 */
	deactivate() {
		if (!this.active) {
			return;
		}

		this.active = false;

		/**
		 * @event Effect#effectDeactivated
		 */
		this.emit('effectDeactivated');
	}

	/**
	 * Remove this effect from its target
	 * @fires Effect#remove
	 */
	remove() {
		/**
		 * @event Effect#remove
		 */
		this.emit('remove');
	}

	/**
	 * Stop this effect from having any effect temporarily
	 */
	pause() {
		this.paused = this.elapsed;
	}

	/**
	 * Resume a paused effect
	 */
	resume() {
		this.startedAt = Date.now() - this.paused;
		this.paused = 0;
	}

	/**
	 * Apply effect attribute modifiers to a given value
	 *
	 * @param {string} attrName
	 * @param {number} currentValue
	 * @return {number} attribute value modified by effect
	 */
	modifyAttribute(attrName: string, currentValue: number) {
		let modifier = (_?: any) => _;
		const attributeModifiers = this.modifiers.attributes;
		if (typeof attributeModifiers === 'function') {
			modifier = (current) => {
				return attributeModifiers.bind(this)(attrName, current);
			};
		} else if (attrName in attributeModifiers) {
			modifier = attributeModifiers[attrName];
		}
		return modifier.bind(this)(currentValue);
	}

	/**
	 * Apply effect property modifiers to a given value
	 *
	 * @param {string} propertyName
	 * @param {number} currentValue
	 * @return {*} property value modified by effect
	 */
	modifyProperty(propertyName: string, currentValue: number) {
		let modifier = (_: any) => _;
		const propertyModifiers = this.modifiers.properties;
		if (typeof propertyModifiers === 'function') {
			modifier = (current) => {
				return propertyModifiers.bind(this)(propertyName, current);
			};
		} else if (propertyName in propertyModifiers) {
			modifier = propertyModifiers[propertyName];
		}
		return modifier.bind(this)(currentValue);
	}

	/**
	 * @param {Damage} damage
	 * @param {number} currentAmount
	 * @param {?Character} attacker
	 * @return {Damage}
	 */
	modifyIncomingDamage(
		damage: Damage,
		currentAmount: number,
		attacker?: PlayerOrNpc
	) {
		const modifier = this.modifiers.incomingDamage.bind(this);
		return modifier(damage, currentAmount, attacker);
	}

	/**
	 * @param {Damage} damage
	 * @param {number} currentAmount
	 * @param {Character} target
	 * @return {Damage}
	 */
	modifyOutgoingDamage(
		damage: Damage,
		currentAmount: number,
		target: Character
	) {
		const modifier = this.modifiers.outgoingDamage.bind(this);
		return modifier(damage, currentAmount, target as PlayerOrNpc);
	}

	/**
	 * Gather data to persist
	 * @return {Object}
	 */
	serialize(): ISerializedEffect {
		let config = Object.assign({}, this.config);
		config.duration = config.duration === Infinity ? -1 : config.duration;

		let state = Object.assign({}, this.state);
		// store lastTick as a difference so we can make sure to start where we left off when we hydrate
		if (state.lastTick && isFinite(state.lastTick as number)) {
			state.lastTick = Date.now() - ((state.lastTick as number) || 0);
		}

		return {
			config,
			elapsed: this.elapsed,
			id: this.id,
			remaining: this.remaining,
			skill: this.skill && (this.skill as Skill).id,
			state,
		};
	}

	/**
	 * Reinitialize from persisted data
	 * @param {GameState}
	 * @param {Object} data
	 */
	hydrate(state: IGameState, data: ISerializedEffect) {
		if (data.config) {
			data.config.duration =
				data.config.duration === -1 ? Infinity : data.config.duration;
			this.config = data.config;
		}

		if (!isNaN(data.elapsed as number)) {
			this.startedAt = Date.now() - (data?.elapsed || 0);
		}

		if (data.state && !isNaN(data.state.lastTick as number)) {
			data.state.lastTick = Date.now() - ((data.state.lastTick as number) || 0);
			this.state = data.state;
		}

		if (data.skill) {
			this.skill =
				state.SkillManager.get(data.skill as string) ||
				state?.SpellManager?.get(data.skill as string);
		}
	}
}
