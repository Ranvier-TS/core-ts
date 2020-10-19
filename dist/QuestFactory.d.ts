import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
import { Player } from './Player';
import { IQuestDef, ISerializedQuestDef, Quest } from './Quest';
export interface IQuestFactoryDef {
    area: string;
    id: string;
    config: IQuestDef;
    npc?: EntityReference;
}
/**
 * @property {Map} quests
 */
export declare class QuestFactory {
    quests: Map<string, IQuestFactoryDef>;
    constructor();
    add(areaName: string, id: string, config: IQuestDef): void;
    set(qid: EntityReference, val: IQuestFactoryDef): void;
    /**
     * Get a quest definition. Use `create` if you want an instance of a quest
     * @param {string} qid
     * @return {object}
     */
    get(qid: EntityReference): IQuestFactoryDef | undefined;
    /**
     * Check to see if a player can start a given quest based on the quest's
     * prerequisite quests
     * @param {entityReference} questRef
     * @return {boolean}
     */
    canStart(player: Player, questRef: EntityReference): boolean;
    /**
     * @param {GameState} GameState
     * @param {entityReference} qid
     * @param {Player}    player
     * @param {Array}     state     current quest state
     * @return {Quest}
     */
    create(GameState: IGameState, qid: EntityReference, player: Player, state?: ISerializedQuestDef[]): Quest;
    /**
     * @param {string} areaName
     * @param {number} id
     * @return {string}
     */
    makeQuestKey(area: string, id: string | number): string;
}
