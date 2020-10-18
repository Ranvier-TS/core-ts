import { Damage } from './Damage';
import { PlayerOrNpc } from './GameEntity';
import { Room } from './Room';
/**
 * Damage class used for applying damage to multiple entities in a room. By
 * default it will target all npcs in the room. To customize this behavior you
 * can extend this class and override the `getValidTargets` method
 */
export declare class AreaOfEffectDamage extends Damage {
    /**
     * @param {Room|Character} target
     * @throws RangeError
     * @fires Room#areaDamage
     */
    commit(room: Room | PlayerOrNpc): void;
    /**
     * Override this method to customize valid targets such as
     * only targeting hostile npcs, or only targeting players, etc.
     * @param {Room} room
     * @return {Array<Character>}
     */
    getValidTargets(room: Room): import("./Npc").Npc[];
}
