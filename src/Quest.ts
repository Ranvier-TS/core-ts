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
	npc?: string;
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
export class Quest extends EventEmitter {
	id: string;
	entityReference: EntityReference;
	config: IQuestDef;
	player: Player;
	goals: QuestGoal[];
	state: Record<string, any> | ISerializedQuestDef[];
	GameState: IGameState;
	started?: string;

	constructor(
		GameState: IGameState,
		id: string,
		config: IQuestDef,
		player: Player
	) {
		super();

		this.id = id;
		this.entityReference = config.entityReference;
		this.config = Object.assign(
			{
				title: 'Missing Quest Title',
				description: 'Missing Quest Description',
				completionMessage: null,
				requires: [],
				level: 1,
				autoComplete: false,
				repeatable: false,
				rewards: [],
				goals: [],
			},
			config
		);

		this.player = player;
		this.goals = [];
		this.state = [];
		this.GameState = GameState;
	}

	/**
	 * Proxy all events to all the goals
	 * @param {string} event
	 * @param {...*}   args
	 */
	emit(event: string | symbol, ...args: any[]) {
		const result = super.emit(event, ...args);

		if (event === 'progress') {
			// don't proxy progress event
			return result;
		}

		this.goals.forEach((goal) => {
			goal.emit(event, ...args);
		});

		return result;
	}

	addGoal(goal: QuestGoal) {
		this.goals.push(goal);
		goal.on('progress', () => this.onProgressUpdated());
	}

	/**
	 * @fires Quest#turn-in-ready
	 * @fires Quest#progress
	 */
	onProgressUpdated() {
		const progress = this.getProgress();

		if (progress.percent >= 100) {
			if (this.config.autoComplete) {
				this.complete();
			} else {
				/**
				 * @event Quest#turn-in-ready
				 */
				this.emit('turn-in-ready');
			}
			return;
		}

		/**
		 * @event Quest#progress
		 * @param {object} progress
		 */
		this.emit('progress', progress);
	}

	/**
	 * @return {{ percent: number, display: string }}
	 */
	getProgress() {
		let overallPercent = 0;
		let overallDisplay: string[] = [];
		this.goals.forEach((goal) => {
			const goalProgress = goal.getProgress();
			overallPercent += goalProgress.percent;
			overallDisplay.push(goalProgress.display);
		});

		return {
			percent: Math.round(overallPercent / this.goals.length),
			display: overallDisplay.join('\r\n'),
		};
	}

	/**
	 * Save the current state of the quest on player save
	 * @return {object}
	 */
	serialize(): ISerializedQuestDef {
		return {
			state: this.goals.map((goal) => goal.serialize()),
			progress: this.getProgress(),
			config: {
				desc: this.config.description,
				level: this.config.level,
				title: this.config.title,
			},
		};
	}

	hydrate() {
		(this.state as ISerializedQuestGoal[]).forEach((goalState, i: number) => {
			this.goals[i].hydrate(goalState.state);
		});
	}

	/**
	 * @fires Quest#complete
	 */
	complete() {
		/**
		 * @event Quest#complete
		 */
		this.emit('complete');
		for (const goal of this.goals) {
			goal.complete();
		}
	}
}
