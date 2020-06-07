'use strict';

/**
 * Keeps track of all the individual mobs in the game
 */
class MobManager {
  constructor() {
    this.mobs = new Map();
  }

  /**
   * @param {Mob} mob
   */
  addMob(mob) {
    this.mobs.set(mob.uuid, mob);
  }

  /**
   * Completely obliterate a mob from the game, nuclear option
   * @param {Mob} mob
   */
  removeMob(mob) {
    mob.effects.clear();

    const sourceRoom = mob.sourceRoom;
    if (sourceRoom) {
      sourceRoom.area.removeNpc(mob);
      sourceRoom.removeNpc(mob, true);
    }

    const room = mob.room;
    if (room && room !== sourceRoom) {
      room.removeNpc(mob);
    }

    if (mob.equipment && mob.equipment.size) {
      mob.equipment.forEach((item, slot) => mob.unequip(slot));
    }
  
    if (mob.inventory && mob.inventory.size) {
      mob.inventory.forEach(item => item.__manager.remove(item));
    }

    mob.__pruned = true;
    mob.removeAllListeners();
    this.mobs.delete(mob.uuid);
  }
}

module.exports = MobManager;
