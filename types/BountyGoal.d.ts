import { IQuestGoalConfig, IQuestGoalState, QuestGoal } from '../src/QuestGoal';

export interface IBountyGoalConfig extends IQuestGoalConfig {
	home: string | null;
	npc: string; // NPC ID to capture
	title: string; // Area ID to return to
}

export interface IBountyGoalState extends IQuestGoalState {
	delivered: boolean;
	found: boolean;
}

export declare class BountyGoal extends QuestGoal<
	IBountyGoalConfig,
	IBountyGoalState
> {}
