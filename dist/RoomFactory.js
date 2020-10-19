"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomFactory = void 0;
const EntityFactory_1 = require("./EntityFactory");
const Room_1 = require("./Room");
/**
 * Stores definitions of rooms to allow for easy creation/cloning
 * @extends EntityFactory
 */
class RoomFactory extends EntityFactory_1.EntityFactory {
    /**
     * Create a new instance of a given room. Room will not be hydrated
     *
     * @param {Area}   area
     * @param {string} entityRef
     * @return {Room}
     */
    create(area, entityRef) {
        const room = this.createByType(area, entityRef, Room_1.Room);
        room.area = area;
        return room;
    }
}
exports.RoomFactory = RoomFactory;
