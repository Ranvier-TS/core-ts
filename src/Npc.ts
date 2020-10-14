import { Area } from "./Area";
import { Character } from "./Character";
import { CommandQueue } from "./CommandQueue";
import { EntityReference } from "./EntityReference";
import { IGameState } from "./GameState";
import { Logger } from "./Logger";
import { Room } from "./Room";
import { Scriptable } from "./Scriptable";

const uuid = require("uuid");

export interface INpcDef {
  script?: string;
  behaviors?: Record<string, any>;
  equipment?: Record<string, { entityRefence: string }>;
  items?: EntityReference[];
  description: string;
  entityReference: EntityReference;
  id: string | number;
  keywords: string[];
  quests?: EntityReference[];
  uuid?: string;
}

/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {Map} behaviors
 * @extends Character
 * @mixes Scriptable
 */
export class Npc extends Scriptable(Character) {
  area: Area;
  script?: string;
  behaviors?: Record<string, any>;

  constructor(area: Area, data: INpcDef) {
    super(data);
    const validate = ['name', 'id'];

    for (const prop of validate) {
      if (!(prop in data)) {
        throw new ReferenceError(
          `NPC in area [${area.name}] missing required property [${prop}]`
        );
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
    this.id = data.id;

    this.quests = data.quests;

    this.uuid = data.uuid || uuid();
    this.commandQueue = new CommandQueue();
  }

  /**
   * Move the npc to the given room, emitting events appropriately
   * @param {Room} nextRoom
   * @param {function} onMoved Function to run after the npc is moved to the next room but before enter events are fired
   * @fires Room#npcLeave
   * @fires Room#npcEnter
   * @fires Npc#enterRoom
   */
  moveTo(nextRoom: Room, onMoved: any = (_: any) => _) {
    const prevRoom = this.room;
    if (this.room) {
      /**
       * @event Room#npcLeave
       * @param {Npc} npc
       * @param {Room} nextRoom
       */
      this.room.emit("npcLeave", this, nextRoom);
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
    nextRoom.emit("npcEnter", this, prevRoom);
    /**
     * @event Npc#enterRoom
     * @param {Room} room
     */
    this.emit("enterRoom", nextRoom);
  }

  hydrate(state: IGameState) {
    super.hydrate(state);
    state.MobManager.addMob(this);

    this.setupBehaviors(state.MobBehaviorManager);

    // Load Npc's default inventory (Array of entityReferences):
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
    // Support composing items within Npc definition (object):
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

    for (const [slot, defaultEqId] of Object.entries(this.defaultEquipment)) {
      Logger.verbose(
        `\tDIST: Equipping item [${defaultEqId}] to npc [${this.name}] in slot [${slot}]`
      );
      const newItem = state.ItemFactory.create(this.area, defaultEqId);
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
      behaviors: new Map(this.behaviors as Iterable<readonly [unknown, unknown]> || {}),
      defaultEquipment: this.defaultEquipment || {},
      defaultItems: this.defaultItems || [],
      keywords: this.keywords,
      quests: this.quests,
      metadata: this.metadata
    });
  }

  get isNpc() {
    return true;
  }
}
