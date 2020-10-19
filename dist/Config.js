"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
let __cache = null;
/**
 * Access class for the `ranvier.json` config
 */
class Config {
    /**
     * @param {string} key
     * @param {*} fallback fallback value
     */
    static get(key, fallback) {
        return key in __cache ? __cache[key] : fallback;
    }
    /**
     * Load `ranvier.json` from disk
     */
    static load(data) {
        __cache = data;
    }
}
exports.Config = Config;
