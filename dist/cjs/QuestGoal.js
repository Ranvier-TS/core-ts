"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestGoal = void 0;
const events_1 = require("events");
/**
 * Representation of a goal of a quest.
 * The {@link http://ranviermud.com/extending/areas/quests/|Quest guide} has instructions on to
 * create new quest goals for quests
 * @extends EventEmitter
 */
class QuestGoal extends events_1.EventEmitter {
    /**
     * @param {Quest} quest Quest this goal is for
     * @param {object} config
     * @param {Player} player
     */
    constructor(quest, config, player) {
        super();
        this.config = Object.assign({
        // no defaults currently
        }, config);
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
            display: '[WARNING] Quest does not have progress display configured. Please tell an admin',
        };
    }
    /**
     * Put any cleanup activities after the quest is finished here
     */
    complete() { }
    serialize() {
        return {
            state: this.state,
            progress: this.getProgress(),
            config: this.config,
        };
    }
    hydrate(state) {
        this.state = state;
    }
}
exports.QuestGoal = QuestGoal;
