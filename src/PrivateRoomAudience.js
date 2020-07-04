'use strict';

const B = require('./Broadcast');
const PrivateAudience = require('./PrivateAudience');

/**
 * Audience class representing a specific targeted player in the same room.
 * Example: `whisper` command.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
class PrivateRoomAudience extends PrivateAudience {
  getBroadcastTargets() {
    const targetPlayerName = this.message.split(' ')[0];
    const targetPlayer = this.state.PlayerManager.getPlayer(targetPlayerName);
    if (targetPlayer !== this.sender) {
      if (targetPlayer && targetPlayer.room.entityReference === this.sender.room.entityReference) {
        const others = this.sender.room.getBroadcastTargets()
          .filter(target => target !== this.sender)
          .filter(target => target !== targetPlayer)
          .filter(target => !target.area)
        if (others.length) {
          // REFACTOR
          for (const other of others) {
            if (!other.getMeta(`whisper::${targetPlayerName}::${this.message}`)) {
              B.sayAt(other, `${this.sender.name} whispers something to ${targetPlayer.name}.`)
              other.setMeta(`whisper::${targetPlayerName}::${this.message}`, true)
            } else {
              delete other.metadata[`whisper::${targetPlayerName}::${this.message}`]
            }
          }
        }
        return [targetPlayer];
      }
    }
    // return token '_self' if they targeted themselves 
    if ((targetPlayer === this.sender) || (targetPlayerName === 'me') || (targetPlayerName === 'self')) {
      return ['_self'];
    }
    else {
      return [];
    }
  }

  alterMessage(message) {
    // Strips target name from message
    return message.split(' ').slice(1).join(' ');
  }
}

module.exports = PrivateRoomAudience;
