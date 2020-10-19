import { ChannelAudience } from './ChannelAudience';
import { PlayerOrNpc } from './GameEntity';
import { IGameState } from './GameState';
import { Player } from './Player';
import { PlayerRoles } from './PlayerRoles';
export interface IChannelLoader extends Array<Channel> {
}
export interface IChannelConfig {
    /** @property {string} name Name of the channel */
    name: string;
    /** @property {ChannelAudience} audience */
    audience: ChannelAudience;
    /** @property {string} [description] */
    description: string;
    /** @property {PlayerRoles} [minRequiredRole] */
    minRequiredRole: PlayerRoles;
    /** @property {string} [color] */
    color?: string;
    /** @property {{sender: function, target: function}} [formatter] */
    formatter: {
        sender: Function;
        target: Function;
    };
    bundle?: string;
    aliases?: string[];
    eventOnly?: boolean;
}
/**
 * @property {ChannelAudience} audience People who receive messages from this channel
 * @property {string} name  Actual name of the channel the user will type
 * @property {string} color Default color. This is purely a helper if you're using default format methods
 * @property {PlayerRoles} minRequiredRole If set only players with the given role or greater can use the channel
 * @property {string} description
 * @property {{sender: function, target: function}} [formatter]
 * @property {boolean} eventOnly If true, only channel events will be fired in response to a message, without
 * explicitly sending the message to players
 */
export declare class Channel {
    /** @property {ChannelAudience} audience People who receive messages from this channel */
    audience: ChannelAudience;
    /** @property {string} name  Actual name of the channel the user will type */
    name: string;
    /** @property {string} color Default color. This is purely a helper if you're using default format methods */
    color: string | null;
    /** @property {PlayerRoles} minRequiredRole If set only players with the given role or greater can use the channel */
    minRequiredRole: PlayerRoles | null;
    /** @property {string} description */
    description: string;
    /** @property {{sender: function, target: function}} [formatter] */
    formatter: {
        sender: Function;
        target: Function;
    };
    bundle: string | null;
    aliases: string[] | null;
    eventOnly: boolean;
    /**
     * @param {object}  config
     * @param {string} config.name Name of the channel
     * @param {ChannelAudience} config.audience
     * @param {string} [config.description]
     * @param {PlayerRoles} [config.minRequiredRole]
     * @param {string} [config.color]
     * @param {{sender: function, target: function}} [config.formatter]
     * @param {boolean} [config.eventOnly]
     */
    constructor(config: IChannelConfig);
    /**
     * @param {GameState} state
     * @param {Player}    sender
     * @param {string}    message
     * @fires GameEntity#channelReceive
     * @fires GameEntity#channelSend
     */
    send(state: IGameState, sender: Player, message: string): void;
    describeSelf(sender: Player): void;
    getUsage(): string;
    /**
     * How to render the message the player just sent to the channel
     * E.g., you may want "chat" to say "You chat, 'message here'"
     * @param {Player} sender
     * @param {Player} target
     * @param {string} message
     * @param {Function} colorify
     * @return {string}
     */
    formatToSender(sender: PlayerOrNpc, target: PlayerOrNpc, message: string, colorify: Function): any;
    /**
     * How to render the message to everyone else
     * E.g., you may want "chat" to say "Playername chats, 'message here'"
     * @param {Player} sender
     * @param {Player} target
     * @param {string} message
     * @param {Function} colorify
     * @return {string}
     */
    formatToReceipient(sender: PlayerOrNpc, target: PlayerOrNpc, message: string, colorify: Function): any;
    colorify(message: string): string;
}
export declare class NoPartyError extends Error {
}
export declare class NoRecipientError extends Error {
}
export declare class NoMessageError extends Error {
}
