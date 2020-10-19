/// <reference types="node" />
import { EventEmitter } from 'events';
import { Player } from './Player';
import { Quest } from './Quest';
export interface IQuestGoalDef {
    name: string;
    type: string;
    config: IQuestGoalConfig;
}
export interface ISerializedQuestGoal {
    state: object;
    progress: {
        percent: number;
        display: string;
    };
    config: IQuestGoalConfig;
}
export interface IQuestGoalConfig {
    [key: string]: any;
}
/**
 * Representation of a goal of a quest.
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new quest goals for quests
 * @extends EventEmitter
 */
export declare class QuestGoal extends EventEmitter {
    config: IQuestGoalConfig;
    quest: Quest;
    state: object;
    player: Player;
    /**
     * @param {Quest} quest Quest this goal is for
     * @param {object} config
     * @param {Player} player
     */
    constructor(quest: Quest, config: IQuestGoalConfig, player: Player);
    /**
     * @return {{ percent: number, display: string}}
     */
    getProgress(): {
        percent: number;
        display: string;
    };
    /**
     * Put any cleanup activities after the quest is finished here
     */
    complete(): void;
    serialize(): ISerializedQuestGoal;
    hydrate(state: object): void;
}
