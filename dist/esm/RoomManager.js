/**
 * Keeps track of all the individual rooms in the game
 */
export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    /**
     * @param {string} entityRef
     * @return {Room}
     */
    getRoom(entityRef) {
        const room = this.rooms.get(entityRef);
        if (!room) {
            throw new Error(`RoomManager can't find the Room [${entityRef}]`);
        }
        return room;
    }
    /**
     * @param {Room} room
     */
    addRoom(room) {
        this.rooms.set(room.entityReference, room);
    }
    /**
     * @param {Room} room
     */
    removeRoom(room) {
        this.rooms.delete(room.entityReference);
    }
}
