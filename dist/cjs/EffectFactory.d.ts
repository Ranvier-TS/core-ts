import { Effect, IEffectConfig, IEffectDef, IEffectState } from './Effect';
import { EventManager } from './EventManager';
import { IGameState } from './GameState';
export interface IEffectFactoryDef {
    definition: IEffectDef;
    eventManager: EventManager;
}
/**
 * @property {Map} effects
 */
export declare class EffectFactory {
    effects: Map<string, IEffectFactoryDef>;
    constructor();
    /**
     * @param {string} id
     * @param {EffectConfig} config
     * @param {GameState} state
     */
    add(id: string, config: IEffectDef, state: IGameState): void;
    has(id: string): boolean;
    /**
     * Get a effect definition. Use `create` if you want an instance of a effect
     * @param {string} id
     * @return {object}
     */
    get(id: string): IEffectDef | undefined;
    /**
     * @param {string}  id      effect id
     * @param {?object} config  Effect.config override
     * @param {?object} state   Effect.state override
     * @return {Effect}
     */
    create(id: string, config?: IEffectConfig, state?: Partial<IEffectState>): Effect;
}
