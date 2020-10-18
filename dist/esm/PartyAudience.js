import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing other players in the same group as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class PartyAudience extends ChannelAudience {
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
