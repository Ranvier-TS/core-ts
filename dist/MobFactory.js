"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobFactory = void 0;
const EntityFactory_1 = require("./EntityFactory");
const Npc_1 = require("./Npc");
/**
 * Stores definitions of npcs to allow for easy creation/cloning
 * @extends EntityFactory
 */
class MobFactory extends EntityFactory_1.EntityFactory {
    /**
     * Create a new instance of a given npc definition. Resulting npc will not
     * have its default inventory.  If you want to also populate its default
     * contents you must manually call `npc.hydrate(state)`
     *
     * @param {Area}   area
     * @param {string} entityRef
     * @return {Npc}
     */
    create(area, entityRef) {
        const npc = this.createByType(area, entityRef, Npc_1.Npc);
        npc.area = area;
        return npc;
    }
}
exports.MobFactory = MobFactory;
