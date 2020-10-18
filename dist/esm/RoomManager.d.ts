import { EntityReference } from './EntityReference';
import { Room } from './Room';
/**
 * Keeps track of all the individual rooms in the game
 */
export declare class RoomManager {
    rooms: Map<string, Room>;
    constructor();
    /**
     * @param {string} entityRef
     * @return {Room}
     */
    getRoom(entityRef: EntityReference): Room;
    /**
     * @param {Room} room
     */
    addRoom(room: Room): void;
    /**
     * @param {Room} room
     */
    removeRoom(room: Room): void;
}
