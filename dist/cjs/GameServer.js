"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameServer = void 0;
const events_1 = require("events");
class GameServer extends events_1.EventEmitter {
    /**
     * @param {commander} commander
     * @fires GameServer#startup
     */
    startup(commander) {
        /**
         * @event GameServer#startup
         * @param {commander} commander
         */
        this.emit('startup', commander);
    }
    /**
     * @fires GameServer#shutdown
     */
    shutdown() {
        /**
         * @event GameServer#shutdown
         */
        this.emit('shutdown');
    }
}
exports.GameServer = GameServer;
