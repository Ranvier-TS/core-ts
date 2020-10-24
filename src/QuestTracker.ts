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

export type SerializedQuestTracker = {
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
export class QuestTracker {
	player: Player;
	activeQuests:
		| Map<EntityReference, Quest>
		| Map<string, IQuestTrackerActiveDef>;
	completedQuests: Map<EntityReference, IQuestTrackerCompletedDef>;
	/**
	 * @param {Player} player
	 * @param {Array}  active
	 * @param {Array}  completed
	 */
	constructor(
		player: Player,
		active: Iterable<readonly [string, IQuestTrackerActiveDef | Quest]>,
		completed: Iterable<readonly [string, IQuestTrackerCompletedDef]>
	) {
		this.player = player;

		this.activeQuests = new Map(active);
		this.completedQuests = new Map(completed);
	}

	/**
	 * Proxy events to all active quests
	 * @param {string} event
	 * @param {...*}   args
	 */
	emit(event: string, ...args: any[]) {
		for (const [qid, quest] of this.activeQuests) {
			if (!(quest as Quest).emit) {
				throw new Error('Attempting to emit to a non-hydrated quest: ' + qid);
			}
			(quest as Quest).emit(event, ...args);
		}
	}

	/**
	 * @param {EntityReference} qid
	 * @return {boolean}
	 */
	isActive(qid: EntityReference) {
		return this.activeQuests.has(qid);
	}

	/**
	 * @param {EntityReference} qid
	 * @return {boolean}
	 */
	isComplete(qid: EntityReference) {
		return this.completedQuests.has(qid);
	}

	get(qid: EntityReference) {
		return this.activeQuests.get(qid) as Quest;
	}

	/**
	 * @param {EntityReference} qid
	 */
	complete(qid: EntityReference) {
		if (!this.isActive(qid)) {
			throw new Error(`Quest ${qid} not started, cannot complete.`);
		}

		this.completedQuests.set(qid, {
			started: this.activeQuests.get(qid)?.started || new Date().toJSON(),
			completedAt: new Date().toJSON(),
		});

		this.activeQuests.delete(qid);
	}

	/**
	 * @param {Quest} quest
	 */
	start(quest: Quest) {
		const qid = quest.entityReference;
		if (this.activeQuests.has(qid)) {
			throw new Error(`Quest ${qid} already started.`);
		}

		quest.started = new Date().toJSON();
		this.activeQuests.set(qid, quest);
		quest.emit('start');
	}

	/**
	 * @param {GameState} state
	 * @param {object}    questData Data pulled from the pfile
	 */
	hydrate(state: IGameState) {
		for (const [qid, data] of this.activeQuests) {
			const quest = state.QuestFactory.create(
				state,
				qid,
				this.player,
				(data.state as ISerializedQuestDef[])
			);
			quest.started = data.started;
			quest.hydrate();

			this.activeQuests.set(qid, quest);
		}
	}

	/**
	 * @return {object}
	 */
	serialize(): SerializedQuestTracker {
		return {
			completed: [...this.completedQuests],
			active: [...this.activeQuests].map(([qid, quest]) => [
				qid,
				(quest as Quest).serialize(),
			]),
		};
	}
}
