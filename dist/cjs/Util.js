"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIterable = void 0;
/**
 * Check to see if a given object is iterable
 * @param {Object} obj
 * @return {boolean}
 */
function isIterable(obj) {
    return obj && typeof obj[Symbol.iterator] === 'function';
}
exports.isIterable = isIterable;
