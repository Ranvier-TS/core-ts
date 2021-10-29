import { IQuestGoalConfig, IQuestGoalState, QuestGoal } from '../src/QuestGoal';

export interface IFetchGoalConfig extends IQuestGoalConfig {
	count: number;
	item: string | null;
	removeItem: boolean;
	title: string;
}

export interface IFetchGoalState extends IQuestGoalState {
	count: number;
}

export declare class FetchGoal extends QuestGoal<
	IFetchGoalConfig,
	IFetchGoalState
> {}
