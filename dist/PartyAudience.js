"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyAudience = void 0;
const ChannelAudience_1 = require("./ChannelAudience");
/**
 * Audience class representing other players in the same group as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class PartyAudience extends ChannelAudience_1.ChannelAudience {
    getBroadcastTargets() {
        var _a;
        if (!((_a = this.sender) === null || _a === void 0 ? void 0 : _a.party)) {
            return [];
        }
        return this.sender.party
            .getBroadcastTargets()
            .filter((player) => player !== this.sender);
    }
}
exports.PartyAudience = PartyAudience;
