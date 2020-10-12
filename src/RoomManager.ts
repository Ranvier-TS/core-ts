import { EntityReference } from "./EntityReference";
import { Room } from "./Room";

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
    return this.rooms.get(entityRef);
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
