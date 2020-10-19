import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
import { Player } from './Player';
import { ISerializedQuestDef, Quest } from './Quest';
export interface IQuestTrackerActiveDef {
    started?: string;
    state?: Record<string, any>;
}
export interface IQuestTrackerCompletedDef {
    started: string;
    completedAt: string;
}
export declare type SerializedQuestTracker = {
    active: [string, ISerializedQuestDef][];
    completed: [string, IQuestTrackerCompletedDef][];
};
/**
 * Keeps track of player quest progress
 *
 * @property {Player} player
 * @property {Map}    completedQuests
 * @property {Map}    activeQuests
 */
export declare class QuestTracker {
    player: Player;
    activeQuests: Map<EntityReference, Quest> | Map<string, IQuestTrackerActiveDef>;
    completedQuests: Map<EntityReference, IQuestTrackerCompletedDef>;
    /**
     * @param {Player} player
     * @param {Array}  active
     * @param {Array}  completed
     */
    constructor(player: Player, active: Iterable<readonly [string, IQuestTrackerActiveDef]>, completed: Iterable<readonly [string, IQuestTrackerCompletedDef]>);
    /**
     * Proxy events to all active quests
     * @param {string} event
     * @param {...*}   args
     */
    emit(event: string, ...args: any[]): void;
    /**
     * @param {EntityReference} qid
     * @return {boolean}
     */
    isActive(qid: EntityReference): boolean;
    /**
     * @param {EntityReference} qid
     * @return {boolean}
     */
    isComplete(qid: EntityReference): boolean;
    get(qid: EntityReference): IQuestTrackerActiveDef | undefined;
    /**
     * @param {EntityReference} qid
     */
    complete(qid: EntityReference): void;
    /**
     * @param {Quest} quest
     */
    start(quest: Quest): void;
    /**
     * @param {GameState} state
     * @param {object}    questData Data pulled from the pfile
     */
    hydrate(state: IGameState): void;
    /**
     * @return {object}
     */
    serialize(): SerializedQuestTracker;
}
