import { Npc } from './Npc';
/**
 * Keeps track of all the individual mobs in the game
 */
export declare class MobManager {
    mobs: Map<string, Npc>;
    constructor();
    /**
     * @param {Npc} mob
     */
    addMob(mob: Npc): void;
    /**
     * Completely obliterate a mob from the game, nuclear option
     * @param {Npc} mob
     */
    removeMob(mob: Npc): void;
}
