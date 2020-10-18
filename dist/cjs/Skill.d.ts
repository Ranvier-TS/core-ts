import { Effect, IEffectDef } from './Effect';
import { PlayerOrNpc } from './GameEntity';
import { IGameState } from './GameState';
import { SkillType } from './SkillType';
export interface ISkillOptions {
    configureEffect?: Function;
    cooldown?: number | ISkillCooldown;
    effect?: string;
    flags?: any[];
    info?: (player: PlayerOrNpc) => void;
    initiatesCombat?: boolean;
    name: string;
    requiresTarget?: boolean;
    resource?: any;
    run: (state: IGameState) => any;
    targetSelf?: boolean;
    type: SkillType;
    options?: any;
}
export interface ISkillCooldown {
    group: string;
    length: number;
}
export interface ISkillResource {
    attribute: string;
    cost: number;
}
/**
 * @property {function (Effect)} configureEffect modify the skill's effect before adding to player
 * @property {null|number}      cooldownLength When a number > 0 apply a cooldown effect to disallow usage
 *                                       until the cooldown has ended
 * @property {string}           effect Id of the passive effect for this skill
 * @property {Array<SkillFlag>} flags
 * @property {function ()}      info Function to run to display extra info about this skill
 * @property {function ()}      run  Function to run when skill is executed/activated
 * @property {GameState}        state
 * @property {SkillType}        type
 */
export declare class Skill {
    configureEffect: Function;
    cooldownGroup: string | null;
    cooldownLength: number | null;
    effect: string | null;
    flags: any[];
    id: string;
    info: Function;
    initiatesCombat: boolean;
    name: string;
    options: object;
    requiresTarget: boolean;
    resource: ISkillResource | ISkillResource[];
    run: Function;
    state: IGameState;
    targetSelf: boolean;
    type: SkillType;
    /**
     * @param {string} id
     * @param {object} config
     * @param {GameState} state
     */
    constructor(id: string, config: ISkillOptions, state: IGameState);
    /**
     * perform an active skill
     * @param {string} args
     * @param {Player} player
     * @param {Character} target
     */
    execute(args: string, player: PlayerOrNpc, target: PlayerOrNpc): boolean;
    /**
     * @param {Player} player
     * @return {boolean} If the player has paid the resource cost(s).
     */
    payResourceCosts(player: PlayerOrNpc): true | void;
    payResourceCost(player: PlayerOrNpc, resource: ISkillResource): void;
    activate(player: PlayerOrNpc): void;
    /**
     * @param {Character} character
     * @return {boolean|Effect} If on cooldown returns the cooldown effect
     */
    onCooldown(character: PlayerOrNpc): false | Effect;
    /**
     * Put this skill on cooldown
     * @param {number} duration Cooldown duration
     * @param {Character} character
     */
    cooldown(character: PlayerOrNpc): void;
    getCooldownId(): string;
    /**
     * Create an instance of the cooldown effect for use by cooldown()
     *
     * @private
     * @return {Effect}
     */
    createCooldownEffect(): Effect;
    getDefaultCooldownConfig(): IEffectDef;
    /**
     * @param {Character} character
     * @return {boolean}
     */
    hasEnoughResources(character: PlayerOrNpc): boolean;
    /**
     * @param {Character} character
     * @param {{ attribute: string, cost: number}} resource
     * @return {boolean}
     */
    hasEnoughResource(character: PlayerOrNpc, resource: ISkillResource): boolean;
}
