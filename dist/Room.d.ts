import { Area } from './Area';
import { ISerializedEffect } from './Effect';
import { SerializedAttributes } from './EffectableEntity';
import { EntityReference } from './EntityReference';
import { GameEntity } from './GameEntity';
import { IGameState } from './GameState';
import { Item } from './Item';
import { Npc } from './Npc';
import { Player } from './Player';
export interface IDoor {
    lockedBy?: EntityReference;
    locked?: boolean;
    closed?: boolean;
}
export interface IExit {
    roomId: string;
    direction: string;
    inferred?: boolean;
    leaveMessage?: string;
}
export interface IRoomDef {
    title: string;
    description: string;
    id: string;
    items?: IRoomItemDef[];
    npcs?: IRoomNpcDef[] | string[];
    script?: string;
    behaviors?: Record<string, any>;
    attributes?: SerializedAttributes;
    effects?: ISerializedEffect[];
    coordinates?: [number, number, number];
    doors?: Record<string, IDoor>;
    exits?: IExit[];
    metadata?: Record<string, any>;
}
export interface IRoomItemDef {
    id: string;
    respawnChance?: number;
    maxLoad?: number;
}
export interface IRoomNpcDef {
    id: string;
}
/**
 * @property {Area}          area         Area room is in
 * @property {{x: number, y: number, z: number}} [coordinates] Defined in yml with array [x, y, z]. Retrieved with coordinates.x, coordinates.y, ...
 * @property {Array<number>} defaultItems Default list of item ids that should load in this room
 * @property {Array<number>} defaultNpcs  Default list of npc ids that should load in this room
 * @property {string}        description  Room description seen on 'look'
 * @property {Array<object>} exits        Exits out of this room { roomId: string, direction: string, inferred: boolean }
 * @property {number}        id           Area-relative id (vnum)
 * @property {Set}           items        Items currently in the room
 * @property {Set}           npcs         Npcs currently in the room
 * @property {Set}           players      Players currently in the room
 * @property {string}        script       Name of custom script attached to this room
 * @property {string}        title        Title shown on look/scan
 * @property {object}        doors        Doors restricting access to this room. See documentation for format
 *
 * @extends GameEntity
 */
declare type ComposableDef<T> = Record<string, Partial<T> | boolean>;
export declare class Room extends GameEntity {
    def: IRoomDef;
    area: Area;
    defaultItems: IRoomItemDef[];
    defaultNpcs: IRoomNpcDef[] | string[] | Record<string, ComposableDef<IRoomNpcDef>>;
    metadata: Record<string, any>;
    script: string | null;
    behaviors: Map<string, any>;
    coordinates: {
        x: number;
        y: number;
        z: number;
    } | null;
    description: string;
    entityReference: EntityReference;
    exits: IExit[];
    id: string;
    title: string;
    doors: Map<string, IDoor>;
    defaultDoors: Record<string, IDoor>;
    items: Set<Item>;
    npcs: Set<Npc>;
    players: Set<Player>;
    spawnedNpcs: Set<Npc>;
    constructor(area: Area, def: IRoomDef);
    /**
     * Emits event on self and proxies certain events to other entities in the room.
     * @param {string} eventName
     * @param {...*} args
     * @return {void}
     */
    emit(eventName: string, ...args: any): boolean;
    /**
     * @param {Player} player
     */
    addPlayer(player: Player): void;
    /**
     * @param {Player} player
     */
    removePlayer(player: Player): void;
    /**
     * @param {Npc} npc
     */
    addNpc(npc: Npc): void;
    /**
     * @param {Npc} npc
     * @param {boolean} removeSpawn
     */
    removeNpc(npc: Npc, removeSpawn?: boolean): void;
    /**
     * @param {Item} item
     */
    addItem(item: Item): void;
    /**
     * @param {Item} item
     */
    removeItem(item: Item): void;
    /**
     * Check if diagonal directions are enabled
     *
     * @return {boolean}
     */
    checkDiagonalDirections(): any;
    /**
     * Get exits for a room. Both inferred from coordinates and  defined in the
     * 'exits' property.
     *
     * @return {Array<{ id: string, direction: string, inferred: boolean, room: Room= }>}
     */
    getExits(): any;
    /**
     * Get the exit definition of a room's exit by searching the exit name
     * @param {string} exitName exit name search
     * @return {false|Object}
     */
    findExit(exitName: string): any;
    /**
     * Get the exit definition of a room's exit to a given room
     * @param {Room} nextRoom
     * @return {false|Object}
     */
    getExitToRoom(nextRoom: Room): any;
    /**
     * Check to see if this room has a door preventing movement from `fromRoom` to here
     * @param {Room} fromRoom
     * @return {boolean}
     */
    hasDoor(fromRoom: Room): boolean;
    /**
     * @param {Room} fromRoom
     * @return {{lockedBy: EntityReference, locked: boolean, closed: boolean}}
     */
    getDoor(fromRoom: Room): IDoor | null | undefined;
    /**
     * Check to see of the door for `fromRoom` is locked
     * @param {Room} fromRoom
     * @return {boolean}
     */
    isDoorLocked(fromRoom: Room): boolean | undefined;
    /**
     * @param {Room} fromRoom
     */
    openDoor(fromRoom: Room): void;
    /**
     * @param {Room} fromRoom
     */
    closeDoor(fromRoom: Room): void;
    /**
     * @param {Room} fromRoom
     */
    unlockDoor(fromRoom: Room): void;
    /**
     * @param {Room} fromRoom
     */
    lockDoor(fromRoom: Room): void;
    /**
     * Spawn an Item in the Room
     *
     * @param {GameState} state
     * @param {string} entityRef
     * @return {Item}
     *
     * @fires Item#spawn
     */
    spawnItem(state: IGameState, entityRef: EntityReference): Item;
    /**
     * Spawn an Npc in the Room
     *
     * @param {GameState} state
     * @param {string} entityRef
     * @return {Npc}
     *
     * @fires Npc#spawn
     */
    spawnNpc(state: IGameState, entityRef: EntityReference): Npc;
    /**
     * Initialize the Room
     *
     * @param {GameState} state
     */
    hydrate(state: IGameState): void;
    /**
     * Used by Broadcaster
     * @return {Array<Character>}
     */
    getBroadcastTargets(): (Player | Npc | this)[];
}
export {};
