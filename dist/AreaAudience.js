"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaAudience = void 0;
const ChannelAudience_1 = require("./ChannelAudience");
/**
 * Audience class representing characters in the same area as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class AreaAudience extends ChannelAudience_1.ChannelAudience {
    getBroadcastTargets() {
        var _a;
        if (!((_a = this.sender) === null || _a === void 0 ? void 0 : _a.room)) {
            return [];
        }
        const { area } = this.sender.room;
        return area
            .getBroadcastTargets()
            .filter((target) => target !== this.sender);
    }
}
exports.AreaAudience = AreaAudience;
