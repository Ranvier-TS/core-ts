import { QuestReward } from './QuestReward';

/**
 * Simple map of quest reward name => class instance
 */
export class QuestRewardManager extends Map<string, typeof QuestReward> {}
