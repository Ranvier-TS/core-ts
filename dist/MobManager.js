"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MobManager = void 0;
/**
 * Keeps track of all the individual mobs in the game
 */
class MobManager {
    constructor() {
        this.mobs = new Map();
    }
    /**
     * @param {Npc} mob
     */
    addMob(mob) {
        this.mobs.set(mob.uuid, mob);
    }
    /**
     * Completely obliterate a mob from the game, nuclear option
     * @param {Npc} mob
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
        mob.inventory.forEach((item) => { var _a; return (_a = item.__manager) === null || _a === void 0 ? void 0 : _a.remove(item); });
        mob.__pruned = true;
        mob.removeAllListeners();
        this.mobs.delete(mob.uuid);
    }
}
exports.MobManager = MobManager;
