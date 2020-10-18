import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing other players in the same group as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export declare class PartyAudience extends ChannelAudience {
    getBroadcastTargets(): import("./GameEntity").PlayerOrNpc[];
}
