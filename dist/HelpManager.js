"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpManager = void 0;
/**
 * Contain/look up helpfiles
 */
class HelpManager {
    constructor() {
        this.helps = new Map();
    }
    /**
     * @param {string} help Helpfile name
     */
    get(help) {
        return this.helps.get(help);
    }
    /**
     * @param {Helpfile} help
     */
    add(help) {
        this.helps.set(help.name, help);
    }
    /**
     * @param {string} search
     * @return {Help}
     */
    find(search) {
        const results = new Map();
        for (const [name, help] of this.helps.entries()) {
            if (name.indexOf(search) === 0) {
                results.set(name, help);
                continue;
            }
            if (help.keywords.some((keyword) => keyword.includes(search))) {
                results.set(name, help);
            }
            if (help.aliases.some((alias) => alias.includes(search))) {
                results.set(name, help);
            }
        }
        return results;
    }
    /**
     * @param {string} search
     * @return {Help}
     */
    findExact(search) {
        const results = new Map();
        for (const [name, help] of this.helps.entries()) {
            if (name.indexOf(search) === 0) {
                results.set(name, help);
                continue;
            }
            if (help.keywords.some((keyword) => keyword === search)) {
                results.set(name, help);
            }
            if (help.aliases.some((alias) => alias === search)) {
                results.set(name, help);
            }
        }
        return results;
    }
    /**
     * Returns first help matching keywords
     * @param {string} search
     * @param {boolean} exact
     * @return {?string}
     */
    getFirst(help) {
        const results = this.find(help);
        if (!results.size) {
            /**
             * No results found
             */
            return null;
        }
        const [_, hfile] = [...results][0];
        return hfile;
    }
}
exports.HelpManager = HelpManager;
