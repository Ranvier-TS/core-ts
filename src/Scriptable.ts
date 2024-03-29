import { BehaviorManager } from './BehaviorManager';
import { EffectableEntity } from './EffectableEntity';
import { PruneableEntity } from './GameEntity';
import { Logger } from './Logger';
import { Constructor } from './Util';

/**
 * @ignore
 * @exports ScriptableFn
 * @param {*} parentClass
 * @return {module:ScriptableFn~Scriptable}
 */
export const Scriptable = <TBase extends Constructor<EffectableEntity>>(ParentClass: TBase) =>
	/**
	 * Mixin for entities that can have behaviors attached from a BehaviorManager
	 * @mixin
	 * @alias module:ScriptableFn~Scriptable
	 */
	class extends ParentClass {
		behaviors?: Map<string, any>;
		constructor(...args: any[]) {
			super(...args);
		}

		emit(name: string, ...args: any) {
			// Squelch events on a pruned entity. Attempts to prevent the case where an entity has been effectively removed
			// from the game but somehow still triggered a listener. Set by respective entity Manager class
			if ((this as PruneableEntity).__pruned) {
				this.removeAllListeners();
				return false;
			}

			return super.emit(name, ...args);
		}

		/**
		 * @param {string} name
		 * @return {boolean}
		 */
		hasBehavior(name: string) {
			return this.behaviors?.has(name);
		}

		/**
		 * @param {string} name
		 * @return {*}
		 */
		getBehavior(name: string) {
			return this.behaviors?.get(name);
		}

		/**
		 * Attach this entity's behaviors from the manager
		 * @param {BehaviorManager} manager
		 */
		setupBehaviors(manager: BehaviorManager) {
			if (!this.behaviors) {
				throw new Error('Behaviors are null or undefined.');
			}

			for (let [behaviorName, config] of this.behaviors) {
				let behavior = manager.get(behaviorName);
				if (!behavior) {
					Logger.warn(
						`No script found for [${this.constructor.name}] behavior '${behaviorName}'`
					);
					continue;
				}

				// behavior may be a boolean in which case it will be `behaviorName: true`
				config = config === true ? {} : config;
				behavior.attach(this, config);
			}
		}
	};
