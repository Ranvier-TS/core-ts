/// <reference types="node" />
import { EventEmitter } from "events";
export declare type Constructor<T = EventEmitter> = new (...args: any[]) => T;
/**
 * Check to see if a given object is iterable
 * @param {Object} obj
 * @return {boolean}
 */
export declare function isIterable(obj: Iterable<unknown>): boolean;
