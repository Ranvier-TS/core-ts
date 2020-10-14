import { Effect } from './Effect';

/**
 * Error used when trying to execute a skill and the player doesn't have enough resources
 * @extends Error
 */
export class NotEnoughResourcesError extends Error {}

/**
 * Error used when trying to execute a passive skill
 * @extends Error
 */
export class PassiveError extends Error {}

/**
 * Error used when trying to execute a skill on cooldown
 * @property {Effect} effect
 * @extends Error
 */
export class CooldownError extends Error {
	effect: Effect;
	/**
	 * @param {Effect} effect Cooldown effect that triggered this error
	 */
	constructor(effect: Effect) {
		super();

		this.effect = effect;
	}
}
