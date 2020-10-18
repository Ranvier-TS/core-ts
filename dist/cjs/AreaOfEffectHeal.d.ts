import { PlayerOrNpc } from './GameEntity';
import { Heal } from './Heal';
import { Room } from './Room';
/**
 * Heal class used for applying healing to multiple entities in a room. By
 * default it will target all players in the room. To customize this behavior you
 * can extend this class and override the `getValidTargets` method
 */
export declare class AreaOfEffectHeal extends Heal {
    /**
     * @param {Room|Character} target
     * @throws RangeError
     * @fires Room#areaHeal
     */
    commit(room: Room | PlayerOrNpc): void;
    /**
     * Override this method to customize valid targets such as
     * only targeting hostile npcs, or only targeting players, etc.
     * @param {Room} room
     * @return {Array<Character>}
     */
    getValidTargets(room: Room): import("./Player").Player[];
}
