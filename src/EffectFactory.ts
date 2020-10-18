import { Effect, IEffectConfig, IEffectDef, IEffectState } from './Effect';
import { EventManager } from './EventManager';
import { IGameState } from './GameState';

export interface IEffectFactoryDef {
	definition: IEffectDef;
	eventManager: EventManager;
}

/**
 * @property {Map} effects
 */
export class EffectFactory {
	effects: Map<string, IEffectFactoryDef>;
	constructor() {
		this.effects = new Map();
	}

	/**
	 * @param {string} id
	 * @param {EffectConfig} config
	 * @param {GameState} state
	 */
	add(id: string, config: IEffectDef, state: IGameState) {
		if (this.effects.has(id)) {
			return;
		}

		let definition = Object.assign({}, config);
		delete definition.listeners;
		let listeners = config.listeners || {};
		if (typeof listeners === 'function') {
			listeners = listeners(state);
		}

		const eventManager = new EventManager();
		for (const event in listeners) {
			eventManager.add(event, listeners[event]);
		}

		this.effects.set(id, { definition, eventManager });
	}

	has(id: string) {
		return this.effects.has(id);
	}

	/**
	 * Get a effect definition. Use `create` if you want an instance of a effect
	 * @param {string} id
	 * @return {object}
	 */
	get(id: string) {
		const entry = this.effects.get(id);
		if (entry) return entry.definition;
	}

	/**
	 * @param {string}  id      effect id
	 * @param {?object} config  Effect.config override
	 * @param {?object} state   Effect.state override
	 * @return {Effect}
	 */
	create(id: string, config?: IEffectConfig, state?: Partial<IEffectState>) {
		const entry = this.effects.get(id);
		if (!entry || !entry.definition) {
			throw new Error(`No valid entry definition found for effect ${id}.`);
		}
		let def = Object.assign({}, entry.definition);
		def.config = Object.assign(def.config || {}, config || {});
		def.state = Object.assign(def.state || {}, state || {});
		const effect = new Effect(id, def);
		entry.eventManager.attach(effect);

		return effect;
	}
}
