import { Npc } from "./Npc";

/**
 * Keeps track of all the individual mobs in the game
 */
export class MobManager {
  mobs: Map<string, Npc>;
  constructor() {
    this.mobs = new Map();
  }

  /**
   * @param {Npc} mob
   */
  addMob(mob: Npc) {
    this.mobs.set(mob.uuid, mob);
  }

  /**
   * Completely obliterate a mob from the game, nuclear option
   * @param {Npc} mob
   */
  removeMob(mob: Npc) {
    mob.effects.clear();
    const room = mob.room;
    if (room) {
      room.area.removeNpc(mob);
      room.removeNpc(mob, true);
    }
    mob.__pruned = true;
    mob.removeAllListeners();
    this.mobs.delete(mob.uuid);
  }
}
