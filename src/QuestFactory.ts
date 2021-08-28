import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
import { Logger } from './Logger';
import { Player } from './Player';
import { IQuestDef, ISerializedQuestDef, Quest } from './Quest';
import { ISerializedQuestGoal } from './QuestGoal';

export interface IQuestFactoryDef {
	area: string;
	id: string;
	config: IQuestDef;
	npc?: EntityReference;
}

/**
 * @property {Map} quests
 */
export class QuestFactory {
	quests: Map<string, IQuestFactoryDef>;
	constructor() {
		this.quests = new Map();
	}

	add(areaName: string, id: string, config: IQuestDef) {
		const entityRef = this.makeQuestKey(areaName, id);
		config.entityReference = entityRef;
		this.quests.set(entityRef, { id, area: areaName, config });
	}

	set(qid: EntityReference, val: IQuestFactoryDef) {
		this.quests.set(qid, val);
	}

	/**
	 * Get a quest definition. Use `create` if you want an instance of a quest
	 * @param {string} qid
	 * @return {object}
	 */
	get(qid: EntityReference) {
		return this.quests.get(qid);
	}

	/**
	 * Check to see if a player can start a given quest based on the quest's
	 * prerequisite quests
	 * @param {entityReference} questRef
	 * @return {boolean}
	 */
	canStart(player: Player, questRef: EntityReference) {
		const quest = this.get(questRef);
		if (!quest) {
			throw new Error(`Invalid quest id [${questRef}]`);
		}

		const tracker = player.questTracker;

		if (tracker.completedQuests.has(questRef) && !quest.config.repeatable) {
			return false;
		}

		if (tracker.isActive(questRef)) {
			return false;
		}

		if (!quest.config.requires) {
			return true;
		}

		return quest.config.requires.every((requiresRef) =>
			tracker.isComplete(requiresRef)
		);
	}

	/**
	 * @param {GameState} GameState
	 * @param {entityReference} qid
	 * @param {Player}    player
	 * @param {Array}     state     current quest state
	 * @return {Quest}
	 */
	create(
		GameState: IGameState,
		qid: EntityReference,
		player: Player,
		state: ISerializedQuestDef[] = []
	) {
		const quest = this.quests.get(qid);
		if (!quest) {
			throw new Error(`Trying to create invalid quest id [${qid}]`);
		}

		const instance = new Quest(GameState, quest.id, quest.config, player);
		instance.state = state;
		for (const goal of quest.config.goals) {
			const goalType = GameState.QuestGoalManager.get(goal.type);
			if (!goalType) {
				throw new Error(
					`QuestFactory did not find the goal with the type [${goal.type}]`
				);
			}
			instance.addGoal(new goalType(instance, goal.config, player));
		}

		instance.on('progress', (progress: ISerializedQuestGoal['progress']) => {
			player.emit('questProgress', instance, progress);
			player.save();
		});

		instance.on('start', () => {
			player.emit('questStart', instance);
			instance.emit('progress', instance.getProgress());
		});

		instance.on('turn-in-ready', () => {
			player.emit('questTurnInReady', instance);
		});

		instance.on('complete', () => {
			player.emit('questComplete', instance);
			player.questTracker.complete(instance.entityReference);

			if (!quest.config.rewards) {
				player.save();
				return;
			}

			for (const reward of quest.config.rewards) {
				try {
					const rewardClass = GameState.QuestRewardManager.get(reward.type);

					if (!rewardClass) {
						throw new Error(
							`Quest [${qid}] has invalid reward type ${reward.type}`
						);
					}

					rewardClass.reward(GameState, instance, reward.config, player);
					player.emit('questReward', reward);
				} catch (e) {
					Logger.warn(`Error in quest ${qid} happened to ${player.name}.`);
					Logger.warn(e);
				}
			}

			player.save();
		});

		return instance;
	}

	/**
	 * @param {string} areaName
	 * @param {number} id
	 * @return {string}
	 */
	makeQuestKey(area: string, id: string | number) {
		return area + ':' + id;
	}
}
