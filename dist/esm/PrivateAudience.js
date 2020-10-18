import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing a specific targeted player.
 * Example: `tell` command or `whisper` command.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class PrivateAudience extends ChannelAudience {
    getBroadcastTargets() {
        var _a;
        const targetPlayerName = this.message.split(' ')[0];
        const targetPlayer = (_a = this.state) === null || _a === void 0 ? void 0 : _a.PlayerManager.getPlayer(targetPlayerName);
        if (targetPlayer) {
            return [targetPlayer];
        }
        return [];
    }
    alterMessage(message) {
        // Strips target name from message
        return message.split(' ').slice(1).join(' ');
    }
}
