import { Damage } from './Damage';
import { PlayerOrNpc } from './GameEntity';
/**
 * Heal is `Damage` that raises an attribute instead of lowering it
 * @extends Damage
 */
export declare class Heal extends Damage {
    /**
     * Raise a given attribute
     * @param {Character} target
     * @fires Character#heal
     * @fires Character#healed
     */
    commit(target: PlayerOrNpc): void;
}
