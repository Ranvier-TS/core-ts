'use strict';

import { isString } from 'util';
import { TelnetStream } from '../types/TelnetStream';
import { WebsocketStream } from '../types/WebsocketStream';
import { Account } from './Account';
import { Character, ICharacterConfig, ISerializedCharacter } from './Character';
import { CommandQueue, ICommandExecutable } from './CommandQueue';
import { Config } from './Config';
import { IGameState } from './GameState';
import { IInventoryDef } from './Inventory';
import { IItemDef, ISerializedItem } from './Item';
import { Logger } from './Logger';
import { Metadata } from './Metadatable';
import { PlayerRoles } from './PlayerRoles';
import { QuestTracker, SerializedQuestTracker } from './QuestTracker';
import { Room } from './Room';

export interface IPlayerDef extends ICharacterConfig {
	account: Account;
	description?: string;
	experience: number;
	password: string;
	prompt: string;
	socket: TelnetStream | WebsocketStream | null;
	quests: SerializedQuestTracker;
	role: PlayerRoles | number;
}

export interface ISerializedPlayer extends ISerializedCharacter {
	account: string;
	description?: string;
	experience: number;
	inventory: IInventoryDef;
	metadata: Metadata;
	password: string;
	prompt: string;
	quests: SerializedQuestTracker;
	role: PlayerRoles | number;
	equipment?: Record<string, IItemDef> | null;
}

/**
 * @property {Account} account
 * @property {number}  experience current experience this level
 * @property {string}  password
 * @property {string}  prompt     default prompt string
 * @property {net.Socket} socket
 * @property {QuestTracker} questTracker
 * @property {Map<string,function ()>} extraPrompts Extra prompts to render after the default prompt
 * @property {{completed: Array, active: Array}} questData
 * @extends Character
 */
export class Player extends Character {
	account: Account | null;
	commandQueue: CommandQueue;
	description?: string;
	experience: number;
	extraPrompts: Map<string, any>;
	password: string;
	prompt: string;
	questTracker: QuestTracker;
	socket: TelnetStream | WebsocketStream | null;
	role: PlayerRoles | number;

	__hydrated: boolean = false;
	__pruned: boolean = false;

	constructor(data: IPlayerDef) {
		super(data);

		this.account = data.account || null;
		this.description = data.description || '';
		this.experience = data.experience || 0;
		this.extraPrompts = new Map();
		this.password = data.password;
		this.prompt = data.prompt || '> ';
		this.socket = data.socket || null;
		const questData = Object.assign(
			{
				completed: [],
				active: [],
			},
			data.quests
		);

		this.questTracker = new QuestTracker(
			this,
			questData.active,
			questData.completed
		);
		this.commandQueue = new CommandQueue();
		this.role = data.role || PlayerRoles.PLAYER;

		// Default max inventory size config
		if (!isFinite(this.inventory.getMax())) {
			this.inventory.setMax(Config.get('defaultMaxPlayerInventory', 20));
		}
	}

	/**
	 * @see CommandQueue::enqueue
	 */
	queueCommand(executable: ICommandExecutable, lag: number) {
		const index = this.commandQueue.enqueue(executable, lag);
		this.emit('commandQueued', index);
	}

	/**
	 * Proxy all events on the player to the quest tracker
	 * @param {string} event
	 * @param {...*}   args
	 */
	emit(event: string, ...args: any) {
		if (this.__pruned || !this.__hydrated) {
			return false;
		}

		const result = super.emit(event, ...args);

		this.questTracker.emit(event, ...args);
		return result;
	}

	/**
	 * Convert prompt tokens into actual data
	 * @param {string} promptStr
	 * @param {object} extraData Any extra data to give the prompt access to
	 */
	interpolatePrompt(
		promptStr: string,
		extraData: Record<string, unknown> = {}
	) {
		let attributeData: Record<string, unknown> = {};
		for (const [attr, value] of this.attributes) {
			attributeData[attr] = {
				current: this.getAttribute(attr),
				max: this.getMaxAttribute(attr),
				base: this.getBaseAttribute(attr),
			};
		}
		const promptData = Object.assign(attributeData, extraData);

		let matches = null;
		while ((matches = promptStr.match(/%([a-z\.]+)%/))) {
			const token = matches[1];
			let promptValue: any = token
				.split('.')
				.reduce(
					(obj, index) => obj && (obj[index] as typeof promptData),
					promptData
				);

			if (promptValue === null || promptValue === undefined) {
				(promptValue as string) = 'invalid-token';
			}
			promptStr = promptStr.replace(matches[0], promptValue as string);
		}

		return promptStr;
	}

	/**
	 * Add a line of text to be displayed immediately after the prompt when the prompt is displayed
	 * @param {string}      id       Unique prompt id
	 * @param {function ()} renderer Function to call to render the prompt string
	 * @param {?boolean}    removeOnRender When true prompt will remove itself once rendered
	 *    otherwise prompt will continue to be rendered until removed.
	 */
	addPrompt(id: string, renderer: Function, removeOnRender: boolean = false) {
		this.extraPrompts.set(id, { removeOnRender, renderer });
	}

	/**
	 * @param {string} id
	 */
	removePrompt(id: string) {
		this.extraPrompts.delete(id);
	}

	/**
	 * @param {string} id
	 * @return {boolean}
	 */
	hasPrompt(id: string) {
		return this.extraPrompts.has(id);
	}

	/**
	 * Move the player to the given room, emitting events appropriately
	 * @param {Room} nextRoom
	 * @param {function} onMoved Function to run after the player is moved to the next room but before enter events are fired
	 * @fires Room#playerLeave
	 * @fires Room#playerEnter
	 * @fires Player#enterRoom
	 */
	moveTo(nextRoom: Room, onMoved = (_?: any) => _) {
		const prevRoom = this.room;
		if (this.room && this.room !== nextRoom) {
			/**
			 * @event Room#playerLeave
			 * @param {Player} player
			 * @param {Room} nextRoom
			 */
			this.room.emit('playerLeave', this, nextRoom);
			this.room.removePlayer(this);
		}

		this.room = nextRoom;
		nextRoom.addPlayer(this);

		onMoved();

		/**
		 * @event Room#playerEnter
		 * @param {Player} player
		 * @param {Room} prevRoom
		 */
		nextRoom.emit('playerEnter', this, prevRoom);
		/**
		 * @event Player#enterRoom
		 * @param {Room} room
		 */
		this.emit('enterRoom', nextRoom);
	}

	save(callback?: Function) {
		if (!this.__hydrated) {
			return;
		}

		this.emit('save', callback);
	}

	hydrate(state: IGameState) {
		super.hydrate(state);

		// QuestTracker has to be hydrated before the rest otherwise events fired by the subsequent
		// hydration will be emitted onto unhydrated quest objects and error
		this.questTracker.hydrate(state);

		// Hydrate inventory
		this.inventory.hydrate(state, this);
		// Hydrate equipment
		// maybe refactor Equipment to be an object like Inventory?
		if (this.__equipment && !this.equipment.size) {
			const eqDefs = this.__equipment as Record<string, IItemDef>;
			this.equipment = new Map();
			console.log({ eqDefs });
			for (const slot in eqDefs) {
				const itemDef= eqDefs[slot];
				try {
					const entityReference = itemDef.entityReference;
					const area = itemDef.area ?? itemDef.entityReference.split(':')[0];
					let newItem = state.ItemFactory.create(
						state.AreaManager.getArea(area),
						entityReference
					);
					
					const inventory = itemDef.inventory;
					if (inventory) {
						newItem.initializeInventoryFromSerialized(itemDef.inventory);
					}
					
					newItem.hydrate(state, itemDef);
					state.ItemManager.add(newItem);
					this.equip(newItem, slot);
					/**
					 * @event Item#spawn
					 */
					newItem.emit('spawn', { type: Player });
				} catch (e) {
					Logger.error(e.message);
				}
			}
		} else {
			this.equipment = new Map();
		}

		if (typeof this.room === 'string') {
			let room = state.RoomManager.getRoom(this.room);
			if (!room) {
				Logger.error(
					`ERROR: Player ${this.name} was saved to invalid room ${this.room}.`
				);
				room = state.AreaManager.getPlaceholderArea().getRoomById(
					'placeholder'
				);
			}

			this.room = room;
			this.moveTo(room);
		}
	}

	serialize(): ISerializedPlayer {
		const account = this.account?.username || '';

		const experience = this.experience;
		const inventory = this.inventory && this.inventory.serialize();
		const metadata = this.metadata || {};
		const password = this.password;
		const prompt = this.prompt;
		const quests = this.questTracker.serialize();
		const role = this.role;
		const data: ISerializedPlayer = Object.assign(super.serialize(), {
			account,
			experience,
			inventory,
			metadata,
			password,
			prompt,
			quests,
			role,
			_id: this.name,
		});

		if (this.equipment instanceof Map) {
			const eq: Record<string, ISerializedItem> = {};
			for (const [slot, item] of this.equipment) {
				eq[slot] = item.serialize();
			}
			data.equipment = eq;
		} else {
			data.equipment = null;
		}

		return data;
	}
}
