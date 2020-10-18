import { EventEmitter } from 'events';
import { Data } from './Data';
import { EventManager } from './EventManager';
import { Logger } from './Logger';
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
export class PlayerManager extends EventEmitter {
    constructor() {
        super();
        this.players = new Map();
        this.events = new EventManager();
        this.loader = null;
        this.on('updateTick', this.tickAll);
    }
    /**
     * Set the entity loader from which players are loaded
     * @param {EntityLoader}
     */
    setLoader(loader) {
        this.loader = loader;
    }
    /**
     * @param {string} name
     * @return {Player}
     */
    getPlayer(name) {
        return this.players.get(name.toLowerCase());
    }
    /**
     * @param {Player} player
     */
    addPlayer(player) {
        this.players.set(this.keyify(player), player);
    }
    /**
     * Remove the player from the game. WARNING: You must manually save the player first
     * as this will modify serializable properties
     * @param {Player} player
     * @param {boolean} killSocket true to also force close the player's socket
     */
    removePlayer(player, killSocket = false) {
        var _a, _b;
        if (killSocket) {
            (_a = player.socket) === null || _a === void 0 ? void 0 : _a.end();
        }
        player.removeAllListeners();
        player.removeFromCombat();
        player.effects.clear();
        (_b = player.room) === null || _b === void 0 ? void 0 : _b.removePlayer(player);
        if (player.equipment instanceof Map && player.equipment.size) {
            player.equipment.forEach((item, slot) => player.unequip(slot));
        }
        player.inventory.forEach((item) => { var _a; return (_a = item.__manager) === null || _a === void 0 ? void 0 : _a.remove(item); });
        player.__pruned = true;
        this.players.delete(this.keyify(player));
    }
    /**
     * @return {array}
     */
    getPlayersAsArray() {
        return Array.from(this.players.values());
    }
    /**
     * @param {string}   behaviorName
     * @param {Function} listener
     */
    addListener(event, listener) {
        this.events.add(event, listener);
        return this;
    }
    /**
     * @param {Function} predicate Filter function
     * @return {array},
     */
    filter(predicate) {
        return this.getPlayersAsArray().filter(predicate);
    }
    /**
     * Load a player for an account
     * @param {GameState} state
     * @param {Account} account
     * @param {string} username
     * @param {boolean} force true to force reload from storage
     * @return {Player}
     */
    async loadPlayer(state, account, username, force) {
        if (this.players.has(username) && !force) {
            return this.getPlayer(username);
        }
        if (!this.loader) {
            throw new Error('No entity loader configured for players');
        }
        const data = await this.loader.fetch(username);
        data.name = username;
        data.account = account;
        const player = new Player(data);
        this.events.attach(player);
        this.addPlayer(player);
        return player;
    }
    /**
     * Turn player into a key used by this class's map
     * @param {Player} player
     * @return {string}
     */
    keyify(player) {
        return player.name.toLowerCase();
    }
    /**
     * @param {string} name
     * @return {boolean}
     */
    exists(name) {
        return Data.exists('player', name);
    }
    /**
     * Save a player
     * @fires Player#save
     */
    async save(player) {
        if (!this.loader) {
            throw new Error('No entity loader configured for players');
        }
        Logger.warn('Serializing...');
        const serialized = player.serialize();
        await this.loader.update(player.name, serialized);
        /**
         * @event Player#saved
         */
        player.emit('saved');
    }
    /**
     * Save all players
     * @fires Player#save
     */
    async saveAll() {
        for (const [name, player] of this.players.entries()) {
            await this.save(player);
        }
    }
    /**
     * @fires Player#updateTick
     */
    tickAll() {
        for (const [name, player] of this.players.entries()) {
            /**
             * @event Player#updateTick
             */
            player.emit('updateTick');
        }
    }
    /**
     * Used by Broadcaster
     * @return {Array<Character>}
     */
    getBroadcastTargets() {
        return this.getPlayersAsArray();
    }
}
