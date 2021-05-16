import { EventEmitter } from 'events';
import { IGameState } from './GameState';
import { isIterable } from './Util';

type EventListenersRecord<T> = Record<string, (this: T, ...args: unknown[]) => void>;

export type EventListeners<T = unknown> =
	| EventListenersRecord<T>
	| ((state: IGameState) => EventListenersRecord<T>);

/**
 * Generic array hash table to store listener definitions `events` is a `Map`
 * whose keys are event names values are the `Set` of listeners to be attached
 * for that event
 */
export class EventManager {
	events: Map<string, Set<Function>>;

	constructor() {
		this.events = new Map();
	}

	/**
	 * Fetch all listeners for a given event
	 * @param {string} name
	 * @return {Set}
	 */
	get(name: string) {
		return this.events.get(name);
	}

	/**
	 * @param {string}   eventName
	 * @param {Function} listener
	 */
	add(eventName: string, listener: Function) {
		if (!this.events.has(eventName)) {
			this.events.set(eventName, new Set());
		}
		this.events.get(eventName)!.add(listener);
	}

	/**
	 * Attach all currently added events to the given emitter
	 * @param {EventEmitter} emitter
	 * @param {Object} config
	 */
	attach(emitter: EventEmitter, config?: object) {
		for (const [event, listeners] of this.events) {
			for (const listener of listeners) {
				if (config) {
					emitter.on(event, listener.bind(emitter, config));
				} else {
					emitter.on(event, listener.bind(emitter));
				}
			}
		}
	}

	/**
	 * Remove all listeners for a given emitter or only those for the given events
	 * If no events are given it will remove all listeners from all events defined
	 * in this manager.
	 *
	 * Warning: This will remove _all_ listeners for a given event list, this includes
	 * listeners not in this manager but attached to the same event
	 *
	 * @param {EventEmitter}  emitter
	 * @param {?string|iterable} events Optional name or list of event names to remove listeners from
	 */
	detach(emitter: EventEmitter, events: string | Iterable<string>) {
		if (typeof events === 'string') {
			events = [events];
		} else if (!events) {
			events = this.events.keys();
		} else if (!isIterable(events)) {
			throw new TypeError('events list passed to detach() is not iterable');
		}

		for (const event of events) {
			emitter.removeAllListeners(event);
		}
	}
}
