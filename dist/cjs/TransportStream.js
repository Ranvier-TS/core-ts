"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransportStream = void 0;
const events_1 = require("events");
/**
 * Base class for anything that should be sending or receiving data from the player
 */
class TransportStream extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this._prompted = false;
    }
    get readable() {
        return true;
    }
    get writable() {
        return true;
    }
    write(message, encoding) {
        /* noop */
    }
    /**
     * A subtype-safe way to execute commands on a specific type of stream that invalid types will ignore. For given input
     * for command (example, `"someCommand"` ill look for a method called `executeSomeCommand` on the `TransportStream`
     * @param {string} command
     * @param {...*} args
     * @return {*}
     */
    command(command, ...args) {
        if (!command || !command.length) {
            throw new RangeError('Must specify a command to the stream');
        }
        const methodName = 'execute' + command[0].toUpperCase() + command.substr(1);
        if (typeof this[methodName] === 'function') {
            const commandMethod = this[methodName];
            return commandMethod(...args);
        }
    }
    address(...args) {
        return null;
    }
    end(...args) {
        /* noop */
    }
    setEncoding(...args) {
        /* noop */
    }
    pause(...args) {
        /* noop */
    }
    resume(...args) {
        /* noop */
    }
    destroy(...args) {
        /* noop */
    }
    /**
     * Attach a socket to this stream
     * @param {*} socket
     */
    attach(socket) {
        this.socket = socket;
        this.socket.on('close', (_) => {
            this.emit('close');
        });
    }
}
exports.TransportStream = TransportStream;
