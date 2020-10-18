import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing characters in the same area as the sender
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export declare class AreaAudience extends ChannelAudience {
    getBroadcastTargets(): (import("./Player").Player | import("./Npc").Npc | import("./Room").Room | import("./Area").Area)[];
}
