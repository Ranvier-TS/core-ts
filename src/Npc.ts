import { Area } from './Area';
import { Character, ICharacterConfig } from './Character';
import { CommandQueue } from './CommandQueue';
import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
import { IItemDef } from './Item';
import { Logger } from './Logger';
import { Room } from './Room';
import { Scriptable } from './Scriptable';

const uuid = require('uuid');

export interface INpcDef extends ICharacterConfig {
	area?: string;
	script?: string;
	behaviors?: Record<string, any>;
	equipment?: Record<string, IItemDef> | Record<string, { entityReference: string; }>;
	items?: EntityReference[];
	description: string;
	entityReference: EntityReference;
	id: string | number;
	keywords: string[];
	quests?: EntityReference[];
	uuid?: string;
}

export class Npc extends Scriptable(Character) {
	area: Area;
	script?: string;
	behaviors?: Map<string, any>;
	defaultEquipment: Record<string, { entityReference: EntityReference }>;
	defaultItems: EntityReference[];
	description: string;
	entityReference: EntityReference;
	id: number | string;
	quests: EntityReference[];
	uuid: string;
	commandQueue: CommandQueue;
	keywords: string[];
  sourceRoom: Room | null;
	__pruned: boolean = false;
	
	static validate: (keyof Npc)[] = ['name', 'id'];
	constructor(area: Area, data: INpcDef) {
		super(data);

		for (const prop of Npc.validate) {
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
		this.keywords = data.keywords;
		this.id = data.id;

		this.quests = data.quests || [];

		this.uuid = data.uuid || uuid();
		this.commandQueue = new CommandQueue();
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
	moveTo(nextRoom: Room, onMoved: any = (_: any) => _) {
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

	hydrate(state: IGameState) {
		super.hydrate(state);
		state.MobManager.addMob(this);

		this.setupBehaviors(state.MobBehaviorManager);

		for (let defaultItemId of this.defaultItems) {
			Logger.verbose(
				`\tDIST: Adding item [${defaultItemId}] to npc [${this.name}]`
			);
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
			Logger.verbose(
				`\tDIST: Equipping item [${defaultEqId}] to npc [${this.name}] in slot [${slot}]`
			);
			const newItem = state.ItemFactory.create(
				this.area,
				defaultEqId.entityReference
			);
			newItem.hydrate(state);
			state.ItemManager.add(newItem);
			this.equip(newItem, slot);
			/**
			 * @event Item#spawn
			 */
			newItem.emit('spawn', { type: Npc });
		}

		return Object.assign(
			{},
			{
				script: this.script,
				behaviors: new Map(
					(this.behaviors as Iterable<readonly [unknown, unknown]>) || new Map()
				),
				defaultEquipment: this.defaultEquipment || {},
				defaultItems: this.defaultItems || [],
				keywords: this.keywords,
				quests: this.quests,
				metadata: this.metadata,
			}
		);
	}

	get isNpc() {
		return true;
	}
}
