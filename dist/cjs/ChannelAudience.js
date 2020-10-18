"use strict";
/**
 * Classes representing various channel audiences
 *
 * See the {@link http://ranviermud.com/extending/channels/|Channel guide} for usage
 * @namespace ChannelAudience
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelAudience = void 0;
/**
 * Base channel audience class
 */
class ChannelAudience {
    constructor(...args) {
        /** @param {string} message */
        this.message = '';
    }
    /**
     * Configure the current state for the audience. Called by {@link Channel#send}
     * @param {object} options
     * @param {GameState} options.state
     * @param {Character} options.sender
     * @param {string} options.message
     */
    configure(options) {
        this.state = options.state;
        this.sender = options.sender;
        this.message = options.message;
    }
    /**
     * Find targets for this audience
     * @return {Array<Player>}
     */
    getBroadcastTargets() {
        var _a;
        return ((_a = this.state) === null || _a === void 0 ? void 0 : _a.PlayerManager.getPlayersAsArray()) || [];
    }
    /**
     * Modify the message to be sent
     * @param {string} message
     * @return {string}
     */
    alterMessage(message) {
        return message;
    }
}
exports.ChannelAudience = ChannelAudience;
