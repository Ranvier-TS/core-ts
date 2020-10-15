import { ChannelAudience } from './ChannelAudience';
import { PlayerOrNpc } from './GameEntity';

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
			.filter((target: PlayerOrNpc) => target !== this.sender);
	}
}
