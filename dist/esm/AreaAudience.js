import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing characters in the same area as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class AreaAudience extends ChannelAudience {
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
