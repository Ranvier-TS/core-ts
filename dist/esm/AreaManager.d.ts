import { Area } from './Area';
import { BehaviorManager } from './BehaviorManager';
import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
/**
 * Stores references to, and handles distribution of, active areas
 * @property {Map<string,Area>} areas
 */
export declare class AreaManager {
    areas: Map<string, Area>;
    scripts: BehaviorManager;
    private placeholder;
    constructor();
    /**
     * @param {string} name
     * @return Area
     */
    getArea(name: string): Area;
    /**
     * @param {string} entityRef
     * @return Area
     */
    getAreaByReference(entityRef: EntityReference): Area;
    /**
     * @param {Area} area
     */
    addArea(area: Area): void;
    /**
     * @param {Area} area
     */
    removeArea(area: Area): void;
    /**
     * Apply `updateTick` to all areas in the game
     * @param {GameState} state
     * @fires Area#updateTick
     */
    tickAll(state: IGameState): void;
    /**
     * Get the placeholder area used to house players who were loaded into
     * an invalid room
     *
     * @return {Area}
     */
    getPlaceholderArea(): Area;
}
