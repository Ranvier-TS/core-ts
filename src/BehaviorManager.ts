import { EventManager } from './EventManager';

export interface IBehavior {
	[key: string]: unknown;
}

/**
 * BehaviorManager keeps a map of BehaviorName:EventManager which is used
 * during Item and NPC hydrate() methods to attach events
 */
export class BehaviorManager {
	behaviors: Map<string, EventManager>;

	constructor() {
		this.behaviors = new Map();
	}

	/**
	 * Get EventManager for a given behavior
	 * @param {string} name
	 * @return {EventManager}
	 */
	get(name: string) {
		return this.behaviors.get(name);
	}

	/**
	 * Check to see if a behavior exists
	 * @param {string} name
	 * @return {boolean}
	 */
	has(name: string) {
		return this.behaviors.has(name);
	}

	/**
	 * @param {string}   behaviorName
	 * @param {string}   event
	 * @param {Function} listener
	 */
	addListener(behaviorName: string, event: string, listener: Function) {
		if (!this.behaviors.has(behaviorName)) {
			this.behaviors.set(behaviorName, new EventManager());
		}

		const behavior = this.behaviors.get(behaviorName);
		if (behavior) {
			behavior.add(event, listener);
		}
	}
}
