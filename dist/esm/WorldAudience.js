import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing everyone in the game, except sender.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class WorldAudience extends ChannelAudience {
    getBroadcastTargets() {
        var _a;
        return (((_a = this.state) === null || _a === void 0 ? void 0 : _a.PlayerManager) || []).filter((player) => player !== this.sender);
    }
}
