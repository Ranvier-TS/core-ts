import { QuestGoal } from './QuestGoal';

/**
 * Simple map of quest goal name => class definition
 */
export class QuestGoalManager extends Map<string, typeof QuestGoal> {}
