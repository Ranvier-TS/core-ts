"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityFactory = void 0;
const BehaviorManager_1 = require("./BehaviorManager");
const Item_1 = require("./Item");
const Npc_1 = require("./Npc");
const Room_1 = require("./Room");
/**
 * Stores definitions of entities to allow for easy creation/cloning
 */
class EntityFactory {
    constructor() {
        this.entities = new Map();
        this.scripts = new BehaviorManager_1.BehaviorManager();
    }
    /**
     * Create the key used by the entities and scripts maps
     * @param {string} areaName
     * @param {number} id
     * @return {string}
     */
    createEntityRef(area, id) {
        return area + ':' + id;
    }
    /**
     * @param {string} entityRef
     * @return {Object}
     */
    getDefinition(entityRef) {
        return this.entities.get(entityRef);
    }
    /**
     * @param {string} entityRef
     * @param {Object} def
     */
    setDefinition(entityRef, def) {
        def.entityReference = entityRef;
        this.entities.set(entityRef, def);
    }
    /**
     * Add an event listener from a script to a specific item
     * @see BehaviorManager::addListener
     * @param {string}   entityRef
     * @param {string}   event
     * @param {Function} listener
     */
    addScriptListener(entityRef, event, listener) {
        this.scripts.addListener(entityRef, event, listener);
    }
    /**
     * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
     * and will _not_ have its default contents. If you want it to also populate its default contents
     * you must manually call `npc.hydrate(state)`
     *
     * @param {Area}   area
     * @param {string} entityRef
     * @param {Class}  Type      Type of entity to instantiate
     * @return {type}
     */
    createByType(area, entityRef, Type) {
        var _a, _b;
        const definition = this.getDefinition(entityRef);
        if (!definition) {
            throw new Error('No Entity definition found for ' + entityRef);
        }
        const entity = new Type(area, definition);
        if ((_a = this.scripts) === null || _a === void 0 ? void 0 : _a.has(entityRef)) {
            (_b = this.scripts.get(entityRef)) === null || _b === void 0 ? void 0 : _b.attach(entity);
        }
        return entity;
    }
    create(...args) {
        throw new Error('No type specified for Entity.create');
    }
    /**
     * Clone an existing entity
     *
     * @param {Item|Npc|Room|Area} entity
     * @return {Item|Npc|Room|Area}
     */
    clone(entity) {
        if (entity instanceof Room_1.Room ||
            entity instanceof Npc_1.Npc ||
            entity instanceof Item_1.Item
        // Area type handled in AreaFactory.clone()
        ) {
            return this.create(entity.area, entity.entityReference);
        }
    }
}
exports.EntityFactory = EntityFactory;
