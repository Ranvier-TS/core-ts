"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldAudience = void 0;
const ChannelAudience_1 = require("./ChannelAudience");
/**
 * Audience class representing everyone in the game, except sender.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class WorldAudience extends ChannelAudience_1.ChannelAudience {
    getBroadcastTargets() {
        var _a;
        return (((_a = this.state) === null || _a === void 0 ? void 0 : _a.PlayerManager) || []).filter((player) => player !== this.sender);
    }
}
exports.WorldAudience = WorldAudience;
