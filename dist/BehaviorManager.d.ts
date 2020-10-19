import { EventManager } from './EventManager';
export interface IBehavior {
    [key: string]: unknown;
}
/**
 * BehaviorManager keeps a map of BehaviorName:EventManager which is used
 * during Item and NPC hydrate() methods to attach events
 */
export declare class BehaviorManager {
    behaviors: Map<string, EventManager>;
    constructor();
    /**
     * Get EventManager for a given behavior
     * @param {string} name
     * @return {EventManager}
     */
    get(name: string): EventManager | undefined;
    /**
     * Check to see if a behavior exists
     * @param {string} name
     * @return {boolean}
     */
    has(name: string): boolean;
    /**
     * @param {string}   behaviorName
     * @param {string}   event
     * @param {Function} listener
     */
    addListener(behaviorName: string, event: string, listener: Function): void;
}
