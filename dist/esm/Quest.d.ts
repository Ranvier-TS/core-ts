/// <reference types="node" />
import { EventEmitter } from 'events';
import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
import { Player } from './Player';
import { IQuestGoalDef, ISerializedQuestGoal, QuestGoal } from './QuestGoal';
import { IQuestRewardDef } from './QuestReward';
export interface IQuestDef {
    id: string;
    entityReference: EntityReference;
    title: string;
    description: string;
    completionMessage?: string;
    requires?: EntityReference[];
    level: number;
    autoComplete?: boolean;
    repeatable?: boolean;
    rewards: IQuestRewardDef[];
    goals: IQuestGoalDef[];
    started?: number;
}
export interface ISerializedQuestDef {
    state: ISerializedQuestGoal[];
    progress: {
        percent: number;
        display: string;
    };
    config: {
        desc: string;
        level: number;
        title: string;
    };
}
/**
 * @property {object} config Default config for this quest, see individual quest types for details
 * @property {Player} player
 * @property {object} state  Current completion state
 * @extends EventEmitter
 */
export declare class Quest extends EventEmitter {
    id: string;
    entityReference: EntityReference;
    config: IQuestDef;
    player: Player;
    goals: QuestGoal[];
    state: Record<string, any> | ISerializedQuestDef[];
    GameState: IGameState;
    started?: string;
    constructor(GameState: IGameState, id: string, config: IQuestDef, player: Player);
    /**
     * Proxy all events to all the goals
     * @param {string} event
     * @param {...*}   args
     */
    emit(event: string | symbol, ...args: any[]): boolean;
    addGoal(goal: QuestGoal): void;
    /**
     * @fires Quest#turn-in-ready
     * @fires Quest#progress
     */
    onProgressUpdated(): void;
    /**
     * @return {{ percent: number, display: string }}
     */
    getProgress(): {
        percent: number;
        display: string;
    };
    /**
     * Save the current state of the quest on player save
     * @return {object}
     */
    serialize(): ISerializedQuestDef;
    hydrate(): void;
    /**
     * @fires Quest#complete
     */
    complete(): void;
}
