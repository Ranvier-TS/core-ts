import { ChannelAudience } from './ChannelAudience';
import { Player } from './Player';

/**
 * Audience class representing everyone in the game, except sender.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export class WorldAudience extends ChannelAudience {
	getBroadcastTargets() {
		return (this.state?.PlayerManager || []).filter(
			(player) => player !== this.sender
		);
	}
}
