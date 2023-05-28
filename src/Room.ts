import { Area } from './Area';
import { Config } from './Config';
import { ISerializedEffect } from './Effect';
import { SerializedAttributes } from './EffectableEntity';
import { EntityDefinitionBase } from './EntityFactory';
import { EntityReference } from './EntityReference';
import { GameEntity } from './GameEntity';
import { IGameState } from './GameState';
import { Item } from './Item';
import { Logger } from './Logger';
import { Npc } from './Npc';
import { Player } from './Player';

export interface IDoor {
	lockedBy?: EntityReference;
	locked?: boolean;
	closed?: boolean;
}

export interface IExit {
	roomId: EntityReference;
	direction: string;
	inferred?: boolean;
	leaveMessage?: string;
}

export interface IRoomDef extends EntityDefinitionBase {
	title: string;
	description: string;
	items?: IRoomItemDef[];
	npcs?: IRoomNpcDef[] | string[];
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
	replaceOnRespawn?: boolean;
	respawnChance?: number;
	maxLoad?: number;
}

export interface IRoomNpcDef {
	id: string;
	maxLoad?: number;
	respawnChance?: number; // percentage
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

type ComposableDef<T> = Record<string, Partial<T> | boolean>;
export class Room extends GameEntity {
	def: IRoomDef;
	area: Area;
	defaultItems: IRoomItemDef[];
	defaultNpcs:
		| IRoomNpcDef[]
		| string[]
		| Record<string, ComposableDef<IRoomNpcDef>>;
	metadata: Record<string, any> = {};
	script: string | null = null;
	behaviors: Map<string, any>;
	coordinates: { x: number; y: number; z: number } | null = null;
	description: string = '';
	entityReference: EntityReference = '';
	exits: IExit[] = [];
	id: string;
	title: string;
	doors: Map<string, IDoor>;
	defaultDoors: Record<string, IDoor>;

	items: Set<Item>;
	npcs: Set<Npc>;
	players: Set<Player>;
	spawnedNpcs: Set<Npc>;

	static validate: string[] = ['title', 'description', 'id'];
	constructor(area: Area, def: IRoomDef) {
		super(def);
		for (const prop of Room.validate) {
			if (!(prop in def)) {
				throw new Error(
					`ERROR: AREA[${area.name}] Room does not have required property ${prop}`
				);
			}
		}

		this.def = def;
		this.area = area;
		this.defaultItems = def.items || [];
		this.defaultNpcs = def.npcs || [];
		this.metadata = def.metadata || {};
		this.script = def.script || null;
		this.behaviors = new Map(Object.entries(def.behaviors || {}));
		this.coordinates =
			Array.isArray(def.coordinates) && def.coordinates.length === 3
				? {
						x: def.coordinates[0],
						y: def.coordinates[1],
						z: def.coordinates[2],
				  }
				: null;
		this.description = def.description;
		this.entityReference = this.area.name + ':' + def.id;
		this.exits = def.exits || [];
		this.id = def.id;
		this.title = def.title;
		// create by-val copies of the doors config so the lock/unlock don't accidentally modify the original definition
		this.doors = new Map(
			Object.entries(JSON.parse(JSON.stringify(def.doors || {})))
		);
		this.defaultDoors = def.doors || {};

		this.items = new Set();
		this.npcs = new Set();
		this.players = new Set();

		/**
		 * spawnedNpcs keeps track of NPCs even when they leave the room for the purposes of respawn. So if we spawn NPC A
		 * into the room and it walks away we don't want to respawn the NPC until it's killed or otherwise removed from the
		 * area
		 */
		this.spawnedNpcs = new Set();
	}

	/**
	 * Emits event on self and proxies certain events to other entities in the room.
	 * @param {string} eventName
	 * @param {...*} args
	 * @return {void}
	 */
	emit(eventName: string, ...args: any) {
		super.emit(eventName, ...args);

		const proxiedEvents = [
			'playerEnter',
			'playerLeave',
			'npcEnter',
			'npcLeave',
		];

		if (proxiedEvents.includes(eventName)) {
			const entities = [...this.npcs, ...this.players, ...this.items];
			for (const entity of entities) {
				entity.emit(eventName, ...args);
			}
		}
		return true;
	}

	/**
	 * @param {Player} player
	 */
	addPlayer(player: Player) {
		this.players.add(player);
	}

	/**
	 * @param {Player} player
	 */
	removePlayer(player: Player) {
		this.players.delete(player);
	}

	/**
	 * @param {Npc} npc
	 */
	addNpc(npc: Npc) {
		this.npcs.add(npc);
		npc.room = this;
		this.area.addNpc(npc);
	}

	/**
	 * @param {Npc} npc
	 * @param {boolean} removeSpawn
	 */
	removeNpc(npc: Npc, removeSpawn: boolean = false) {
		this.npcs.delete(npc);
		if (removeSpawn) {
			this.spawnedNpcs.delete(npc);
		}
		npc.room = null;
	}

	/**
	 * @param {Item} item
	 */
	addItem(item: Item) {
		this.items.add(item);
		item.room = this;
	}

	/**
	 * @param {Item} item
	 */
	removeItem(item: Item) {
		this.items.delete(item);
		item.room = null;
	}

	/**
	 * Check if diagonal directions are enabled
	 *
	 * @return {boolean}
	 */
	checkDiagonalDirections() {
		if (this.metadata.diagonalDirections !== undefined) {
			return this.metadata.diagonalDirections;
		}
		if (Config.get('diagonalDirections') !== undefined) {
			return Config.get('diagonalDirections');
		} else return true;
	}

	/**
	 * Get exits for a room. Both inferred from coordinates and  defined in the
	 * 'exits' property.
	 *
	 * @return {Array<{ id: string, direction: string, inferred: boolean, room: Room= }>}
	 */
	getExits(): IExit[] {
		const exits: IExit[] = JSON.parse(JSON.stringify(this.exits)).map(
			(exit: IExit) => {
				exit.inferred = false;
				return exit;
			}
		);

		if (!this.area || !this.coordinates) {
			return exits;
		}

		let adjacents = [
			{ dir: 'west', coord: [-1, 0, 0] },
			{ dir: 'east', coord: [1, 0, 0] },
			{ dir: 'north', coord: [0, 1, 0] },
			{ dir: 'south', coord: [0, -1, 0] },
			{ dir: 'up', coord: [0, 0, 1] },
			{ dir: 'down', coord: [0, 0, -1] },
		];

		if (this.checkDiagonalDirections()) {
			adjacents = [
				...adjacents,
				{ dir: 'northeast', coord: [1, 1, 0] },
				{ dir: 'northwest', coord: [-1, 1, 0] },
				{ dir: 'southeast', coord: [1, -1, 0] },
				{ dir: 'southwest', coord: [-1, -1, 0] },
			];
		}

		for (const adj of adjacents) {
			const [x, y, z] = adj.coord;
			const room = this.area.getRoomAtCoordinates(
				this.coordinates.x + x,
				this.coordinates.y + y,
				this.coordinates.z + z
			);

			if (room && !exits.find((ex: IExit) => ex.direction === adj.dir)) {
				exits.push({
					roomId: room.entityReference,
					direction: adj.dir,
					inferred: true,
				});
			}
		}

		return exits;
	}

	/**
	 * Get the exit definition of a room's exit by searching the exit name
	 * @param {string} exitName exit name search
	 * @return {false|Object}
	 */
	findExit(exitName: string) {
		const exits = this.getExits();

		if (!exits.length) {
			return false;
		}

		const roomExit = exits.find(
			(ex: IExit) => ex.direction.indexOf(exitName) === 0
		);

		return roomExit || false;
	}

	/**
	 * Get the exit definition of a room's exit to a given room
	 * @param {Room} nextRoom
	 * @return {false|Object}
	 */
	getExitToRoom(nextRoom: Room) {
		const exits = this.getExits();

		if (!exits.length) {
			return false;
		}

		const roomExit = exits.find(
			(ex: IExit) => ex.roomId === nextRoom.entityReference
		);

		return roomExit || false;
	}

	/**
	 * Check to see if this room has a door preventing movement from `fromRoom` to here
	 * @param {Room} fromRoom
	 * @return {boolean}
	 */
	hasDoor(fromRoom: Room) {
		return this.doors.has(fromRoom.entityReference);
	}

	/**
	 * @param {Room} fromRoom
	 * @return {{lockedBy: EntityReference, locked: boolean, closed: boolean}}
	 */
	getDoor(fromRoom: Room) {
		if (!fromRoom) {
			return null;
		}
		return this.doors.get(fromRoom.entityReference);
	}

	/**
	 * Check to see of the door for `fromRoom` is locked
	 * @param {Room} fromRoom
	 * @return {boolean}
	 */
	isDoorLocked(fromRoom: Room) {
		const door = this.getDoor(fromRoom);
		if (!door) {
			return false;
		}

		return door.locked;
	}

	/**
	 * @param {Room} fromRoom
	 */
	openDoor(fromRoom: Room) {
		const door = this.getDoor(fromRoom);
		if (!door) {
			return;
		}

		door.closed = false;
	}

	/**
	 * @param {Room} fromRoom
	 */
	closeDoor(fromRoom: Room) {
		const door = this.getDoor(fromRoom);
		if (!door) {
			return;
		}

		door.closed = true;
	}

	/**
	 * @param {Room} fromRoom
	 */
	unlockDoor(fromRoom: Room) {
		const door = this.getDoor(fromRoom);
		if (!door) {
			return;
		}

		door.locked = false;
	}

	/**
	 * @param {Room} fromRoom
	 */
	lockDoor(fromRoom: Room) {
		const door = this.getDoor(fromRoom);
		if (!door) {
			return;
		}

		this.closeDoor(fromRoom);
		door.locked = true;
	}

	/**
	 * Spawn an Item in the Room
	 *
	 * @param {GameState} state
	 * @param {string} entityRef
	 * @return {Item}
	 *
	 * @fires Item#spawn
	 */
	spawnItem(state: IGameState, entityRef: EntityReference) {
		Logger.verbose(
			`\tSPAWN: Adding item [${entityRef}] to room [${this.title}]`
		);
		const newItem = state.ItemFactory.create(this.area, entityRef);
		newItem.hydrate(state);
		newItem.sourceRoom = this;
		state.ItemManager.add(newItem);
		this.addItem(newItem);
		/**
		 * @event Item#spawn
		 */
		newItem.emit('spawn', { type: Room });
		return newItem;
	}

	/**
	 * Spawn an Npc in the Room
	 *
	 * @param {GameState} state
	 * @param {string} entityRef
	 * @return {Npc}
	 *
	 * @fires Npc#spawn
	 */
	spawnNpc(state: IGameState, entityRef: EntityReference) {
		Logger.verbose(
			`\tSPAWN: Adding npc [${entityRef}] to room [${this.title}]`
		);
		const newNpc = state.MobFactory.create(this.area, entityRef);
		newNpc.hydrate(state);
		newNpc.sourceRoom = this;
		this.area.addNpc(newNpc);
		this.addNpc(newNpc);
		this.spawnedNpcs.add(newNpc);
		/**
		 * @event Npc#spawn
		 */
		newNpc.emit('spawn');
		return newNpc;
	}

	/**
	 * Initialize the Room
	 *
	 * @param {GameState} state
	 */
	hydrate(state: IGameState) {
		super.hydrate(state);
		this.setupBehaviors(state.RoomBehaviorManager);

		/**
		 * Fires when the room is created but before it has hydrated its default
		 * contents. Use the `ready` event if you need default items to be there.
		 * @event Room#spawn
		 */
		this.emit('spawn');

		this.items = new Set();

		// NOTE: This method effectively defines the fact that items/npcs do not
		// persist through reboot unless they're stored on a player.
		// If you would like to change that functionality this is the place

		this.defaultItems.forEach((defaultItem) => {
			if (typeof defaultItem === 'string') {
				defaultItem = { id: defaultItem };
			}

			this.spawnItem(state, defaultItem.id);
		});

		// LOAD ROOMS'S DEFAULT NPCS (ARRAY)
		if (Array.isArray(this.defaultNpcs)) {
			this.defaultNpcs.forEach((defaultNpc: IRoomNpcDef | string) => {
				if (typeof defaultNpc === 'string') {
					defaultNpc = { id: defaultNpc };
				}

				try {
					this.spawnNpc(state, defaultNpc.id);
				} catch (err) {
					Logger.error(err);
				}
			});
			// Support composing Npcs in room using an object.
		} else {
			Object.keys(this.defaultNpcs).forEach((defaultNpc: EntityReference) => {
				const npc: Partial<IRoomNpcDef> | boolean = (
					this.defaultNpcs as ComposableDef<IRoomNpcDef>
				)[defaultNpc];
				if (npc === false) return;
				try {
					this.spawnNpc(state, defaultNpc.replace(/%.*$/g, ''));
				} catch (err) {
					Logger.error(err);
				}
			});
		}
	}

	/**
	 * Used by Broadcaster
	 * @return {Array<Character>}
	 */
	getBroadcastTargets() {
		return [this, ...this.players, ...this.npcs];
	}
}
