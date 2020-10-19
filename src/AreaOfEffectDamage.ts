import { Character } from './Character';
import { Damage } from './Damage';
import { PlayerOrNpc } from './GameEntity';
import { Room } from './Room';

/**
 * Damage class used for applying damage to multiple entities in a room. By
 * default it will target all npcs in the room. To customize this behavior you
 * can extend this class and override the `getValidTargets` method
 */
export class AreaOfEffectDamage extends Damage {
	/**
	 * @param {Room|Character} target
	 * @throws RangeError
	 * @fires Room#areaDamage
	 */
	commit(room: Room | PlayerOrNpc) {
		if (!(room instanceof Room)) {
			if (!(room instanceof Character)) {
				throw new RangeError(
					'AreaOfEffectDamage commit target must be an instance of Room or Character'
				);
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
	getValidTargets(room: Room) {
		const targets = [...room.npcs];
		return targets.filter((t) => t.hasAttribute(this.attribute));
	}
}
