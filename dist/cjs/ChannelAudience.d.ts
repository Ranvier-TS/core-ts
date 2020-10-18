/**
 * Classes representing various channel audiences
 *
 * See the {@link http://ranviermud.com/extending/channels/|Channel guide} for usage
 * @namespace ChannelAudience
 */
import { Area } from './Area';
import { AnyGameEntity, PlayerOrNpc } from './GameEntity';
import { IGameState } from './GameState';
import { Npc } from './Npc';
import { Player } from './Player';
import { Room } from './Room';
export declare type AreaBroadcastable = Player | Npc | Room | Area;
export interface AudienceOptions {
    /** @param {GameState} state */
    state: IGameState;
    /** @param {Character} sender */
    sender: PlayerOrNpc;
    /** @param {string} message */
    message: string;
}
/**
 * Base channel audience class
 */
export declare class ChannelAudience {
    /** @param {GameState} state */
    state?: IGameState;
    /** @param {Character} sender */
    sender?: PlayerOrNpc;
    /** @param {string} message */
    message: string;
    constructor(...args: any[]);
    /**
     * Configure the current state for the audience. Called by {@link Channel#send}
     * @param {object} options
     * @param {GameState} options.state
     * @param {Character} options.sender
     * @param {string} options.message
     */
    configure(options: AudienceOptions): void;
    /**
     * Find targets for this audience
     * @return {Array<Player>}
     */
    getBroadcastTargets(): AnyGameEntity[];
    /**
     * Modify the message to be sent
     * @param {string} message
     * @return {string}
     */
    alterMessage(message: string): string;
}
