'use strict';

const uuid = require('uuid/v4');
const Attributes = require('./Attributes');
const Character = require('./Character');
const Config = require('./Config');
const Logger = require('./Logger');
const Scriptable = require('./Scriptable');
const CommandQueue = require('./CommandQueue');

/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {Map} behaviors
 * @extends Character
 * @mixes Scriptable
 */
class Npc extends Scriptable(Character) {
  constructor(area, data) {
    super(data);
    const validate = ['name', 'id'];

    for (const prop of validate) {
      if (!(prop in data)) {
        throw new ReferenceError(`NPC in area [${area.name}] missing required property [${prop}]`);
      }
    }

    this.area = data.area;
    this.script = data.script;
    this.behaviors = new Map(Object.entries(data.behaviors || {}));
    this.equipment = new Map();
    this.defaultEquipment = data.equipment || {};
    this.defaultItems = data.items || [];
    this.description = data.description;
    this.entityReference = data.entityReference; 
    this.id = data.id;

    if (data.keywords && data.keywords.value) {
      this.keywordsInherited = true;
      this.keywords = [...new Set([...(data.keywords.value || []), ...this.name.split(' ')])];
    } else {
      this.keywords = [...new Set([...(data.keywords || []), ...this.name.split(' ')])];
    }

    this.quests = data.quests;
    if (data.quests && data.quests.value) {
      this.questsInherited = true;
      this.quests = [...new Set((data.quests.value || []))];
    } else {
      this.quests = [...new Set((data.quests || []))];
    }

    this.uuid = data.uuid || uuid();
    this.commandQueue = new CommandQueue();
    this.prototype = data.prototype || null;
  }

  /**
   * Move the npc to the given room, emitting events appropriately
   * @param {Room} nextRoom
   * @param {function} onMoved Function to run after the npc is moved to the next room but before enter events are fired
   * @fires Room#npcLeave
   * @fires Room#npcEnter
   * @fires Npc#enterRoom
   */
  moveTo(nextRoom, onMoved = _ => _) {
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

  /**
   * Initialize the NPC from storage
   * 
   * @param {GameState} state
   */
  hydrate(state) {
    super.hydrate(state);
    state.MobManager.addMob(this);

    this.setupBehaviors(state.MobBehaviorManager);

    // LOAD NPC'S DEFAULT INVENTORY (ARRAY)
    if (Array.isArray(this.defaultItems)) {
      for (let defaultItemId of this.defaultItems) {
        Logger.verbose(`\tDIST: Adding item [${defaultItemId}] to npc [${this.name}]`);
        const newItem = state.ItemFactory.create(this.area, defaultItemId);

        state.ItemManager.add(newItem);
        this.addItem(newItem);
        newItem.hydrate(state);
        /**
         * @event Item#spawn
         */
        newItem.emit('spawn');
      }
    // SUPPORT COMPOSING ITEMS WITHIN NPC IN NPCS.YML (OBJECT)
    } else {
      Object.keys(this.defaultItems).forEach(defaultItemId => {
        if (this.defaultItems[defaultItemId] === false) return;
        Logger.verbose(`\tDIST: Adding item [${defaultItemId.replace(/%.*$/g, '')}] to npc [${this.name}]`);
        const newItem = state.ItemFactory.create(this.area, defaultItemId.replace(/%.*$/g, ''));


        state.ItemFactory.modifyDefinition(newItem, false, this.defaultItems[defaultItemId]);
        state.ItemManager.add(newItem);
        this.addItem(newItem);
        newItem.hydrate(state);
        /**
         * @event Item#spawn
         */
        newItem.emit('spawn');
      })
    }

    for (let [slot, defaultEqId] of Object.entries(this.defaultEquipment)) {
      Logger.verbose(`\tDIST: Equipping item [${defaultEqId}] to npc [${this.name}] in slot [${slot}]`);
      const newItem = state.ItemFactory.create(this.area, defaultEqId);
      newItem.hydrate(state);
      state.ItemManager.add(newItem);
      this.equip(newItem, slot);
      /**
       * @event Item#spawn
       */
      newItem.emit('spawn');
    }
  }

  /**
   * Serialize the NPC to be used as a prototype
   * 
   * @return {Object}
   */
  serializeIntoPrototype () {
    const char = this.serialize();

    // adjust keywords for inheritance
    let keywords;
    if (this.keywordsInherited) {
      keywords = {
        '...': true,
        value: this.keywords
      };
    } else {
      keywords = this.keywords;
    }

    // adjust quests for inheritance
    let quests;
    if (this.questsInherited) {
      quests = {
        '...': true,
        value: this.quests
      };
    } else {
      quests = this.quests;
    }

    // check description for inheritance
    if (this.description.length > 0) {
       char.description = this.description;
    }

    // delete hydration props
    delete char.inventory;
    delete char.effects;

    return Object.assign(char, {
      script: this.script,
      behaviors: new Map(this.behaviors || {}),
      defaultEquipment: this.defaultEquipment || {},
      defaultItems: this.defaultItems || [],
      keywords,
      quests,
      metadata: this.metadata
    });
  }

  get isNpc() {
    return true;
  }
}

module.exports = Npc;
