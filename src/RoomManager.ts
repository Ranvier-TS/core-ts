import { EntityReference } from './EntityReference';
import { Room } from './Room';

/**
 * Keeps track of all the individual rooms in the game
 */
export class RoomManager {
	rooms: Map<string, Room>;
	constructor() {
		this.rooms = new Map();
	}

	/**
	 * @param {string} entityRef
	 * @return {Room}
	 */
	getRoom(entityRef: EntityReference) {
		const room = this.rooms.get(entityRef);
		if (!room) {
			throw new Error(`RoomManager can't find the Room [${entityRef}]`);
		}
		return room;
	}

	/**
	 * @param {Room} room
	 */
	addRoom(room: Room) {
		this.rooms.set(room.entityReference, room);
	}

	/**
	 * @param {Room} room
	 */
	removeRoom(room: Room) {
		this.rooms.delete(room.entityReference);
	}
}
