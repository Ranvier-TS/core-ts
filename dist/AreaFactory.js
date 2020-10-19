"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaFactory = void 0;
const Area_1 = require("./Area");
const EntityFactory_1 = require("./EntityFactory");
/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
class AreaFactory extends EntityFactory_1.EntityFactory {
    /**
     * Create a new instance of an area by name. Resulting area will not have
     * any of its contained entities (items, npcs, rooms) hydrated. You will
     * need to call `area.hydrate(state)`
     *
     * @param {GameState} state
     * @param {string} bundle Name of this bundle this area is defined in
     * @param {string} entityRef Area name
     * @return {Area}
     */
    create(entityRef) {
        var _a, _b;
        const definition = this.getDefinition(entityRef);
        if (!definition) {
            throw new Error('No Entity definition found for ' + entityRef);
        }
        const area = new Area_1.Area(definition.bundle, entityRef, definition.manifest);
        if (this.scripts.has(entityRef)) {
            (_b = (_a = this.scripts) === null || _a === void 0 ? void 0 : _a.get(entityRef)) === null || _b === void 0 ? void 0 : _b.attach(area);
        }
        return area;
    }
    /**
     * @see AreaFactory#create
     */
    clone(area) {
        return this.create(area.name);
    }
}
exports.AreaFactory = AreaFactory;
