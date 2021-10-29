import { IQuestGoalConfig, IQuestGoalState, QuestGoal } from '../src/QuestGoal';

export interface IKillGoalConfig extends IQuestGoalConfig {
	count: number;
	npc: string | null;
	title: string;
}

export interface IKillGoalState extends IQuestGoalState {
	count: number;
}

export declare class KillGoal extends QuestGoal<
	IKillGoalConfig,
	IKillGoalState
> {}
