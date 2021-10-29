import { Broadcastable } from '.';
import { ChannelAudience } from './ChannelAudience';

/**
 * Audience class representing characters in the same area as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class AreaAudience extends ChannelAudience {
	getBroadcastTargets() {
		if (!this.sender?.room) {
			return [];
		}

		const { area } = this.sender.room;
		return area
			.getBroadcastTargets()
			.filter((target: Broadcastable) => target !== this.sender);
	}
}
