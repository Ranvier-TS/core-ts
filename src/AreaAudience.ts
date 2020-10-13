import { ChannelAudience } from "./ChannelAudience";
import { Npc } from "./Npc";
import { Player } from "./Player";

/**
 * Audience class representing characters in the same area as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class AreaAudience extends ChannelAudience {
  getBroadcastTargets() {
    if (!this.sender.room) {
      return [];
    }

    const { area } = this.sender.room;
    return area
      .getBroadcastTargets()
      .filter((target: Npc | Player) => target !== this.sender);
  }
}
