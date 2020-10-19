"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Npc = void 0;
const Character_1 = require("./Character");
const CommandQueue_1 = require("./CommandQueue");
const Logger_1 = require("./Logger");
const Scriptable_1 = require("./Scriptable");
const uuid = require('uuid');
/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {Map} behaviors
 * @extends Character
 * @mixes Scriptable
 */
class Npc extends Scriptable_1.Scriptable(Character_1.Character) {
    constructor(area, data) {
        super(data);
        this.__pruned = false;
        const validate = ['name', 'id'];
        for (const prop of validate) {
            if (!(prop in data)) {
                throw new ReferenceError(`NPC in area [${area.name}] missing required property [${prop}]`);
            }
        }
        this.area = area;
        this.script = data.script;
        this.behaviors = new Map(Object.entries(data.behaviors || {}));
        this.equipment = new Map();
        this.defaultEquipment = data.equipment || {};
        this.defaultItems = data.items || [];
        this.description = data.description;
        this.entityReference = data.entityReference;
        this.keywords = data.keywords;
        this.id = data.id;
        this.quests = data.quests || [];
        this.uuid = data.uuid || uuid();
        this.commandQueue = new CommandQueue_1.CommandQueue();
        this.sourceRoom = null;
    }
    /**
     * Move the npc to the given room, emitting events appropriately
     * @param {Room} nextRoom
     * @param {function} onMoved Function to run after the npc is moved to the next room but before enter events are fired
     * @fires Room#npcLeave
     * @fires Room#npcEnter
     * @fires Npc#enterRoom
     */
    moveTo(nextRoom, onMoved = (_) => _) {
        const prevRoom = this.room;
        if (this.room) {
            /**
             * @event Room#npcLeave
             * @param {Npc} npc
             * @param {Room} nextRoom
             */
            this.room.emit('npcLeave', this, nextRoom);
            this.room.removeNpc(this);
        }
        this.room = nextRoom;
        nextRoom.addNpc(this);
        onMoved();
        /**
         * @event Room#npcEnter
         * @param {Npc} npc
         * @param {Room} prevRoom
         */
        nextRoom.emit('npcEnter', this, prevRoom);
        /**
         * @event Npc#enterRoom
         * @param {Room} room
         */
        this.emit('enterRoom', nextRoom);
    }
    hydrate(state) {
        super.hydrate(state);
        state.MobManager.addMob(this);
        this.setupBehaviors(state.MobBehaviorManager);
        for (let defaultItemId of this.defaultItems) {
            Logger_1.Logger.verbose(`\tDIST: Adding item [${defaultItemId}] to npc [${this.name}]`);
            const newItem = state.ItemFactory.create(this.area, defaultItemId);
            state.ItemManager.add(newItem);
            this.addItem(newItem);
            newItem.hydrate(state);
            /**
             * @event Item#spawn
             */
            newItem.emit('spawn');
        }
        for (const [slot, defaultEqId] of Object.entries(this.defaultEquipment)) {
            Logger_1.Logger.verbose(`\tDIST: Equipping item [${defaultEqId}] to npc [${this.name}] in slot [${slot}]`);
            const newItem = state.ItemFactory.create(this.area, defaultEqId.entityRefence);
            newItem.hydrate(state);
            state.ItemManager.add(newItem);
            this.equip(newItem, slot);
            /**
             * @event Item#spawn
             */
            newItem.emit('spawn', { type: Npc });
        }
        return Object.assign({}, {
            script: this.script,
            behaviors: new Map(this.behaviors || {}),
            defaultEquipment: this.defaultEquipment || {},
            defaultItems: this.defaultItems || [],
            keywords: this.keywords,
            quests: this.quests,
            metadata: this.metadata,
        });
    }
    get isNpc() {
        return true;
    }
}
exports.Npc = Npc;
