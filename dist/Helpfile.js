"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Helpfile = void 0;
/**
 * Representation of an in game helpfile
 */
class Helpfile {
    /**
     * @param {string} bundle Bundle the helpfile comes from
     * @param {string} name
     * @param {object} options
     * @param {Array<string>} [options.keywords]
     * @param {string} [options.command]
     * @param {string} [options.channel]
     * @param {Array<string>} [options.related]
     * @param {string} [options.tooltip]
     * @param {string} options.body
     */
    constructor(bundle, name, options) {
        this.bundle = bundle;
        this.name = name;
        if (!options || !options.body) {
            throw new Error(`Help file [${name}] has no content.`);
        }
        this.keywords = options.keywords || [name];
        this.command = options.command;
        this.channel = options.channel;
        this.related = options.related || [];
        this.body = options.body;
        this.aliases = options.aliases || [];
    }
}
exports.Helpfile = Helpfile;
