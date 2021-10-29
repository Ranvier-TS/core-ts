import { IQuestGoalConfig, IQuestGoalState, QuestGoal } from '../src/QuestGoal';

export interface IEquipGoalConfig extends IQuestGoalConfig {
	slot: string[];
	title: string;
}

export interface IEquipGoalState extends IQuestGoalState {
	equipped: boolean;
}

export declare class EquipGoal extends QuestGoal<
	IEquipGoalConfig,
	IEquipGoalState
> {}
