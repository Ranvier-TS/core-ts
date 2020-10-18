import { TelnetStream } from '../types/TelnetStream';
import { WebsocketStream } from '../types/WebsocketStream';
import { Character, ICharacterConfig, ISerializedCharacter } from './Character';
import { CommandQueue, ICommandExecutable } from './CommandQueue';
import { IGameState } from './GameState';
import { IInventoryDef } from './Inventory';
import { IItemDef } from './Item';
import { Metadata } from './Metadatable';
import { PlayerRoles } from './PlayerRoles';
import { QuestTracker, SerializedQuestTracker } from './QuestTracker';
import { Room } from './Room';
export interface IPlayerDef extends ICharacterConfig {
    account: Account;
    experience: number;
    password: string;
    prompt: string;
    socket: TelnetStream | WebsocketStream | null;
    quests: SerializedQuestTracker;
    role: PlayerRoles | number;
}
export interface ISerializedPlayer extends ISerializedCharacter {
    account: string;
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
export declare class Player extends Character {
    account: Account | null;
    commandQueue: CommandQueue;
    experience: number;
    extraPrompts: Map<string, any>;
    password: string;
    prompt: string;
    questTracker: QuestTracker;
    socket: TelnetStream | WebsocketStream | null;
    role: PlayerRoles | number;
    __hydrated: boolean;
    __pruned: boolean;
    constructor(data: IPlayerDef);
    /**
     * @see CommandQueue::enqueue
     */
    queueCommand(executable: ICommandExecutable, lag: number): void;
    /**
     * Proxy all events on the player to the quest tracker
     * @param {string} event
     * @param {...*}   args
     */
    emit(event: string, ...args: any): boolean;
    /**
     * Convert prompt tokens into actual data
     * @param {string} promptStr
     * @param {object} extraData Any extra data to give the prompt access to
     */
    interpolatePrompt(promptStr: string, extraData?: Record<string, unknown>): string;
    /**
     * Add a line of text to be displayed immediately after the prompt when the prompt is displayed
     * @param {string}      id       Unique prompt id
     * @param {function ()} renderer Function to call to render the prompt string
     * @param {?boolean}    removeOnRender When true prompt will remove itself once rendered
     *    otherwise prompt will continue to be rendered until removed.
     */
    addPrompt(id: string, renderer: Function, removeOnRender?: boolean): void;
    /**
     * @param {string} id
     */
    removePrompt(id: string): void;
    /**
     * @param {string} id
     * @return {boolean}
     */
    hasPrompt(id: string): boolean;
    /**
     * Move the player to the given room, emitting events appropriately
     * @param {Room} nextRoom
     * @param {function} onMoved Function to run after the player is moved to the next room but before enter events are fired
     * @fires Room#playerLeave
     * @fires Room#playerEnter
     * @fires Player#enterRoom
     */
    moveTo(nextRoom: Room, onMoved?: (_?: any) => any): void;
    save(callback?: Function): void;
    hydrate(state: IGameState): void;
    serialize(): ISerializedPlayer;
}
