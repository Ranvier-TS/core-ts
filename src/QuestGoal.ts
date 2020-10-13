"use strict";

import { EventEmitter } from "events";
import { Player } from "./Player";
import { Quest } from "./Quest";

export interface IQuestGoalDef {}

/**
 * Representation of a goal of a quest.
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new quest goals for quests
 * @extends EventEmitter
 */
export class QuestGoal extends EventEmitter {
  config: IQuestGoalDef;
  quest: Quest;
  state: object;
  player: Player;
  /**
   * @param {Quest} quest Quest this goal is for
   * @param {object} config
   * @param {Player} player
   */
  constructor(quest: Quest, config: IQuestGoalDef, player: Player) {
    super();

    this.config = Object.assign(
      {
        // no defaults currently
      },
      config
    );
    this.quest = quest;
    this.state = {};
    this.player = player;
  }

  /**
   * @return {{ percent: number, display: string}}
   */
  getProgress() {
    return {
      percent: 0,
      display:
        "[WARNING] Quest does not have progress display configured. Please tell an admin",
    };
  }

  /**
   * Put any cleanup activities after the quest is finished here
   */
  complete() {}

  serialize() {
    return {
      state: this.state,
      progress: this.getProgress(),
      config: this.config,
    };
  }

  hydrate(state: object) {
    this.state = state;
  }
}
