import { AreaFloor } from './AreaFloor';
import { ISerializedEffect } from './Effect';
import { SerializedAttributes } from './EffectableEntity';
import { GameEntity } from './GameEntity';
import { IGameState } from './GameState';
import { Metadata } from './Metadatable';
import { Npc } from './Npc';
import { Player } from './Player';
import { Room } from './Room';
export interface IAreaDef {
    title: string;
    metadata?: Metadata;
    script?: string;
    behaviors?: Record<string, any>;
    attributes?: SerializedAttributes;
    effects?: ISerializedEffect[];
}
/**
 * Representation of an in game area
 * See the {@link http://ranviermud.com/extending/areas/|Area guide} for documentation on how to
 * actually build areas.
 *
 * @property {string} bundle Bundle this area comes from
 * @property {string} name
 * @property {string} title
 * @property {string} script A custom script for this item
 * @property {Map}    map a Map object keyed by the floor z-index, each floor is an array with [x][y] indexes for coordinates.
 * @property {Map<string, Room>} rooms Map of room id to Room
 * @property {Set<Npc>} npcs Active NPCs that originate from this area. Note: this is NPCs that
 *   _originate_ from this area. An NPC may not actually be in this area at any given moment.
 * @property {Object} info Area configuration
 * @property {Number} lastRespawnTick milliseconds since last respawn tick. See {@link Area#update}
 *
 * @extends GameEntity
 */
export declare class Area extends GameEntity {
    /** Bundle this area comes from */
    bundle: string | null;
    /** @property {string} name */
    name: string;
    /** @property {string} title */
    title: string;
    /** @property {string} script A custom script for this item */
    script: string | undefined;
    /** @property {Map<number, AreaFloor>} map a Map object keyed by the floor z-index, each floor is an array with [x][y] indexes for coordinates. */
    map: Map<number, AreaFloor>;
    /** Map of room id to Room */
    rooms: Map<string, Room>;
    /** Active NPCs that originate from this area. Note: this is NPCs that */
    npcs: Set<Npc>;
    metadata: Metadata;
    behaviors: Map<string, any>;
    constructor(bundle: string | null, name: string, manifest: IAreaDef);
    /**
     * Get ranvier-root-relative path to this area
     * @return {string}
     */
    get areaPath(): string;
    /**
     * Get an ordered list of floors in this area's map
     * @return {Array<number>}
     */
    get floors(): number[];
    /**
     * @param {string} id Room id
     * @return {Room|undefined}
     */
    getRoomById(id: string): Room;
    /**
     * @param {Room} room
     * @fires Area#roomAdded
     */
    addRoom(room: Room): void;
    /**
     * @param {Room} room
     * @fires Area#roomRemoved
     */
    removeRoom(room: Room): void;
    /**
     * @param {Room} room
     * @throws Error
     */
    addRoomToMap(room: Room): void;
    /**
     * Remove a room from the map
     * @param {Room} room
     * @throws Error
     */
    removeRoomFromMap(room: Room): void;
    /**
     * find a room at the given coordinates for this area
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @return {Room|boolean}
     */
    getRoomAtCoordinates(x: number, y: number, z: number): Room | undefined;
    /**
     * @param {Npc} npc
     */
    addNpc(npc: Npc): void;
    /**
     * Removes an NPC from the area. NOTE: This must manually remove the NPC from its room as well
     * @param {Npc} npc
     */
    removeNpc(npc: Npc): void;
    /**
     * This method is automatically called every N milliseconds where N is defined in the
     * `setInterval` call to `GameState.AreaManager.tickAll` in the `ranvier` executable. It, in turn,
     * will fire the `updateTick` event on all its rooms and npcs
     *
     * @param {GameState} state
     * @fires Room#updateTick
     * @fires Npc#updateTick
     */
    update(state: IGameState): void;
    hydrate(state: IGameState): void;
    /**
     * Get all possible broadcast targets within an area. This includes all npcs,
     * players, rooms, and the area itself
     * @return {Array<Broadcastable>}
     */
    getBroadcastTargets(): (Player | Npc | Room | this)[];
}
