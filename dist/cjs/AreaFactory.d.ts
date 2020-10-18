import { Area } from './Area';
import { EntityFactory } from './EntityFactory';
import { EntityReference } from './EntityReference';
/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
export declare class AreaFactory extends EntityFactory {
    /**
     * Create a new instance of an area by name. Resulting area will not have
     * any of its contained entities (items, npcs, rooms) hydrated. You will
     * need to call `area.hydrate(state)`
     *
     * @param {GameState} state
     * @param {string} bundle Name of this bundle this area is defined in
     * @param {string} entityRef Area name
     * @return {Area}
     */
    create(entityRef: EntityReference): Area;
    /**
     * @see AreaFactory#create
     */
    clone(area: Area): Area;
}
