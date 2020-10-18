import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing other players in the same room as the sender
 * Could even be used to broadcast to NPCs if you want them to pick up on dialogue,
 * just make them broadcastables.
 *
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export declare class RoomAudience extends ChannelAudience {
    getBroadcastTargets(): (import("./Player").Player | import("./Npc").Npc | import("./Room").Room)[];
}
