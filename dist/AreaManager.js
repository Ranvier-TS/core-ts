"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaManager = void 0;
const Area_1 = require("./Area");
const BehaviorManager_1 = require("./BehaviorManager");
const Room_1 = require("./Room");
/**
 * Stores references to, and handles distribution of, active areas
 * @property {Map<string,Area>} areas
 */
class AreaManager {
    constructor() {
        this.areas = new Map();
        this.scripts = new BehaviorManager_1.BehaviorManager();
        this.placeholder = null;
    }
    /**
     * @param {string} name
     * @return Area
     */
    getArea(name) {
        const area = this.areas.get(name);
        if (!area) {
            throw new Error(`AreaManager can't find the Area [${name}]`);
        }
        return area;
    }
    /**
     * @param {string} entityRef
     * @return Area
     */
    getAreaByReference(entityRef) {
        const [name] = entityRef.split(':');
        const area = this.getArea(name);
        if (!area) {
            throw new Error(`AreaManager did not find Area [${entityRef}] with name [${name}]`);
        }
        return area;
    }
    /**
     * @param {Area} area
     */
    addArea(area) {
        this.areas.set(area.name, area);
    }
    /**
     * @param {Area} area
     */
    removeArea(area) {
        this.areas.delete(area.name);
    }
    /**
     * Apply `updateTick` to all areas in the game
     * @param {GameState} state
     * @fires Area#updateTick
     */
    tickAll(state) {
        for (const [name, area] of this.areas) {
            /**
             * @see Area#update
             * @event Area#updateTick
             */
            area.emit('updateTick', state);
        }
    }
    /**
     * Get the placeholder area used to house players who were loaded into
     * an invalid room
     *
     * @return {Area}
     */
    getPlaceholderArea() {
        if (this.placeholder) {
            return this.placeholder;
        }
        this.placeholder = new Area_1.Area(null, 'placeholder', {
            title: 'Placeholder',
        });
        const placeholderRoom = new Room_1.Room(this.placeholder, {
            id: 'placeholder',
            title: 'Placeholder',
            description: 'You are not in a valid room. Please contact an administrator.',
        });
        this.placeholder.addRoom(placeholderRoom);
        return this.placeholder;
    }
}
exports.AreaManager = AreaManager;
