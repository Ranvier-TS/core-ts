/// <reference types="node" />
import { EventEmitter } from 'events';
import { IGameState } from './GameState';
export declare type EventListeners = Record<string, () => void> | ((state: IGameState) => Record<string, () => void>);
/**
 * Generic array hash table to store listener definitions `events` is a `Map`
 * whose keys are event names values are the `Set` of listeners to be attached
 * for that event
 */
export declare class EventManager {
    events: Map<string, Set<Function>>;
    constructor();
    /**
     * Fetch all listeners for a given event
     * @param {string} name
     * @return {Set}
     */
    get(name: string): Set<Function> | undefined;
    /**
     * @param {string}   eventName
     * @param {Function} listener
     */
    add(eventName: string, listener: Function): void;
    /**
     * Attach all currently added events to the given emitter
     * @param {EventEmitter} emitter
     * @param {Object} config
     */
    attach(emitter: EventEmitter, config?: object): void;
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
    detach(emitter: EventEmitter, events: string | Iterable<string>): void;
}
