import { ChannelAudience } from './ChannelAudience';
export class RoleAudience extends ChannelAudience {
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
