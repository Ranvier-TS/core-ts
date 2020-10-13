import { ChannelAudience } from "./ChannelAudience";

/**
 * Audience class representing a specific targeted player.
 * Example: `tell` command or `whisper` command.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class PrivateAudience extends ChannelAudience {
  getBroadcastTargets() {
    const targetPlayerName = this.message.split(' ')[0];
    const targetPlayer = this.state.PlayerManager.getPlayer(targetPlayerName);

    // return token '_self' if player targeted themselves
    if ((targetPlayer === this.sender) || (targetPlayerName === 'me') || (targetPlayerName === 'self')) {
      return ['_self']
    } else {
      return []
    }

    if (targetPlayer) {
      return [targetPlayer];
    }
  }

  alterMessage(message: string) {
    // Strips target name from message
    return message.split(' ').slice(1).join(' ');
  }
}