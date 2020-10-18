import { ChannelAudience } from './ChannelAudience';
/**
 * Audience class representing a specific targeted player.
 * Example: `tell` command or `whisper` command.
 * @memberof ChannelAudience
 * @extends ChannelAudience
 */
export declare class PrivateAudience extends ChannelAudience {
    getBroadcastTargets(): import("./Player").Player[];
    alterMessage(message: string): string;
}
