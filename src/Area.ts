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
	bundle: string;
	manifest: IAreaManifest;
	quests: string[];
	items: string[];
	npcs: string[];
	rooms: string[];
}

export interface IAreaManifest {
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
export class Area extends GameEntity {
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

	constructor(bundle: string | null, name: string, manifest: IAreaManifest) {
		super(manifest);
		this.bundle = bundle;
		this.name = name;
		this.title = manifest.title;
		this.metadata = manifest.metadata || {};
		this.rooms = new Map();
		this.npcs = new Set();
		this.map = new Map();
		this.script = manifest.script;
		this.behaviors = new Map(Object.entries(manifest.behaviors || {}));

		this.on('updateTick', (state: IGameState) => {
			this.update(state);
		});
	}

	/**
	 * Get ranvier-root-relative path to this area
	 * @return {string}
	 */
	get areaPath() {
		return `${this.bundle}/areas/${this.name}`;
	}

	/**
	 * Get an ordered list of floors in this area's map
	 * @return {Array<number>}
	 */
	get floors() {
		return [...this.map.keys()].sort();
	}

	/**
	 * @param {string} id Room id
	 * @return {Room|undefined}
	 */
	getRoomById(id: string): Room {
		const room = this.rooms.get(id);
		if (!room) {
			throw new Error(`Area did not find Room with id: [${id}]`);
		}
		return room;
	}

	/**
	 * @param {Room} room
	 * @fires Area#roomAdded
	 */
	addRoom(room: Room) {
		this.rooms.set(room.id, room);

		if (room.coordinates) {
			this.addRoomToMap(room);
		}

		/**
		 * @event Area#roomAdded
		 * @param {Room} room
		 */
		this.emit('roomAdded', room);
	}

	/**
	 * @param {Room} room
	 * @fires Area#roomRemoved
	 */
	removeRoom(room: Room) {
		this.removeRoomFromMap(room);

		/**
		 * @event Area#roomRemoved
		 * @param {Room} room
		 */
		this.emit('roomRemoved', room);
	}

	/**
	 * @param {Room} room
	 * @throws Error
	 */
	addRoomToMap(room: Room) {
		if (!room.coordinates) {
			throw new Error('Room does not have coordinates');
		}

		const { x, y, z } = room.coordinates;

		if (!this.map.has(z)) {
			this.map.set(z, new AreaFloor(z));
		}

		const floor = this.map.get(z);
		floor && floor.addRoom(x, y, room);
	}

	/**
	 * Remove a room from the map
	 * @param {Room} room
	 * @throws Error
	 */
	removeRoomFromMap(room: Room) {
		if (!room.coordinates) {
			throw new Error('Room does not have coordinates');
		}

		const { x, y, z } = room.coordinates;

		if (!this.map.has(z)) {
			throw new Error(`Floor ${z} doesn't exist`);
		}

		const floor = this.map.get(z);
		if (!floor) {
			throw new Error(`Floor ${z} is undefined or null.`);
		}

		floor.removeRoom(x, y);
	}

	/**
	 * find a room at the given coordinates for this area
	 * @param {number} x
	 * @param {number} y
	 * @param {number} z
	 * @return {Room|boolean}
	 */
	getRoomAtCoordinates(x: number, y: number, z: number) {
		const floor = this.map.get(z);
		return floor && floor.getRoom(x, y);
	}

	/**
	 * @param {Npc} npc
	 */
	addNpc(npc: Npc) {
		this.npcs.add(npc);
	}

	/**
	 * Removes an NPC from the area. NOTE: This must manually remove the NPC from its room as well
	 * @param {Npc} npc
	 */
	removeNpc(npc: Npc) {
		this.npcs.delete(npc);
	}

	/**
	 * This method is automatically called every N milliseconds where N is defined in the
	 * `setInterval` call to `GameState.AreaManager.tickAll` in the `ranvier` executable. It, in turn,
	 * will fire the `updateTick` event on all its rooms and npcs
	 *
	 * @param {GameState} state
	 * @fires Room#updateTick
	 * @fires Npc#updateTick
	 */
	update(state: IGameState) {
		for (const [id, room] of this.rooms) {
			/**
			 * @see Area#update
			 * @event Room#updateTick
			 */
			room.emit('updateTick');
		}

		for (const npc of this.npcs) {
			/**
			 * @see Area#update
			 * @event Npc#updateTick
			 */
			npc.emit('updateTick');
		}
	}

	hydrate(state: IGameState) {
		this.setupBehaviors(state.AreaBehaviorManager);
		const rooms = state.AreaFactory.getDefinition(this.name)?.rooms || [];
		for (const roomRef of rooms) {
			const room = state.RoomFactory.create(this, roomRef);
			this.addRoom(room);
			state.RoomManager.addRoom(room);
			room.hydrate(state);
			/**
			 * Fires after the room is hydrated and added to its area
			 * @event Room#ready
			 */
			room.emit('ready');
		}
	}

	/**
	 * Get all possible broadcast targets within an area. This includes all npcs,
	 * players, rooms, and the area itself
	 * @return {Array<Broadcastable>}
	 */
	getBroadcastTargets() {
		const roomTargets = [...this.rooms].reduce(
			(acc, [, room]) => acc.concat(room.getBroadcastTargets()),
			[] as (Room | Player | Npc)[]
		);
		return [this, ...roomTargets];
	}
}
