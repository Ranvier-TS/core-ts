"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleAudience = void 0;
const ChannelAudience_1 = require("./ChannelAudience");
class RoleAudience extends ChannelAudience_1.ChannelAudience {
    constructor(options) {
        super(options);
        if (!options.hasOwnProperty('minRole')) {
            throw new Error('No role given for role audience');
        }
        this.minRole = options.minRole;
    }
    getBroadcastTargets() {
        var _a;
        return (((_a = this.state) === null || _a === void 0 ? void 0 : _a.PlayerManager) || []).filter((player) => player.role >= this.minRole && player !== this.sender);
    }
}
exports.RoleAudience = RoleAudience;
