"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaOfEffectDamage = void 0;
const Character_1 = require("./Character");
const Damage_1 = require("./Damage");
const Room_1 = require("./Room");
/**
 * Damage class used for applying damage to multiple entities in a room. By
 * default it will target all npcs in the room. To customize this behavior you
 * can extend this class and override the `getValidTargets` method
 */
class AreaOfEffectDamage extends Damage_1.Damage {
    /**
     * @param {Room|Character} target
     * @throws RangeError
     * @fires Room#areaDamage
     */
    commit(room) {
        if (!(room instanceof Room_1.Room)) {
            if (!(room instanceof Character_1.Character)) {
                throw new RangeError('AreaOfEffectDamage commit target must be an instance of Room or Character');
            }
            super.commit(room);
            return;
        }
        const targets = this.getValidTargets(room);
        for (const target of targets) {
            super.commit(target);
        }
        /**
         * @event Room#areaDamage
         * @param {Damage} damage
         * @param {Array<Character>} targets
         */
        room.emit('areaDamage', this, targets);
    }
    /**
     * Override this method to customize valid targets such as
     * only targeting hostile npcs, or only targeting players, etc.
     * @param {Room} room
     * @return {Array<Character>}
     */
    getValidTargets(room) {
        const targets = [...room.npcs];
        return targets.filter((t) => t.hasAttribute(this.attribute));
    }
}
exports.AreaOfEffectDamage = AreaOfEffectDamage;
