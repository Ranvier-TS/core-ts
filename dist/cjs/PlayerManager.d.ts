/// <reference types="node" />
import { EventEmitter } from 'events';
import { Account } from './Account';
import { EntityLoader } from './EntityLoader';
import { EventManager } from './EventManager';
import { IGameState } from './GameState';
import { Player } from './Player';
/**
 * Keeps track of all active players in game
 * @extends EventEmitter
 * @property {Map} players
 * @property {EventManager} events Player events
 * @property {EntityLoader} loader
 * @listens PlayerManager#save
 * @listens PlayerManager#updateTick
 */
export declare class PlayerManager extends EventEmitter {
    players: Map<string, Player>;
    events: EventManager;
    loader: EntityLoader | null;
    constructor();
    /**
     * Set the entity loader from which players are loaded
     * @param {EntityLoader}
     */
    setLoader(loader: EntityLoader): void;
    /**
     * @param {string} name
     * @return {Player}
     */
    getPlayer(name: string): Player | undefined;
    /**
     * @param {Player} player
     */
    addPlayer(player: Player): void;
    /**
     * Remove the player from the game. WARNING: You must manually save the player first
     * as this will modify serializable properties
     * @param {Player} player
     * @param {boolean} killSocket true to also force close the player's socket
     */
    removePlayer(player: Player, killSocket?: boolean): void;
    /**
     * @return {array}
     */
    getPlayersAsArray(): Player[];
    /**
     * @param {string}   behaviorName
     * @param {Function} listener
     */
    addListener(event: string, listener: (...args: any[]) => void): this;
    /**
     * @param {Function} predicate Filter function
     * @return {array},
     */
    filter(predicate: (player: Player, index: number, array: Player[]) => boolean): Player[];
    /**
     * Load a player for an account
     * @param {GameState} state
     * @param {Account} account
     * @param {string} username
     * @param {boolean} force true to force reload from storage
     * @return {Player}
     */
    loadPlayer(state: IGameState, account: Account, username: string, force: boolean): Promise<Player | undefined>;
    /**
     * Turn player into a key used by this class's map
     * @param {Player} player
     * @return {string}
     */
    keyify(player: Player): string;
    /**
     * @param {string} name
     * @return {boolean}
     */
    exists(name: string): any;
    /**
     * Save a player
     * @fires Player#save
     */
    save(player: Player): Promise<void>;
    /**
     * Save all players
     * @fires Player#save
     */
    saveAll(): Promise<void>;
    /**
     * @fires Player#updateTick
     */
    tickAll(): void;
    /**
     * Used by Broadcaster
     * @return {Array<Character>}
     */
    getBroadcastTargets(): Player[];
}
