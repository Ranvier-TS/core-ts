import { PlayerOrNpc } from './GameEntity';

/**
 * @property {string} attribute Attribute the damage is going to apply to
 * @property {number} amount Initial amount of damage to be done
 * @property {?Character} attacker Character causing the damage
 * @property {*} source Where the damage came from: skill, item, room, etc.
 * @property {Object} metadata Extra info about the damage: type, hidden, critical, etc.
 */
export class Damage {
	attribute: string;
	attacker?: PlayerOrNpc | null;
	amount: number;
	source?: any = null;
	metadata: Record<string, unknown>;

	/**
	 * @param {string} attribute Attribute the damage is going to apply to
	 * @param {number} amount
	 * @param {Character} [attacker=null] Character causing the damage
	 * @param {*} [source=null] Where the damage came from: skill, item, room, etc.
	 * @property {Object} metadata Extra info about the damage: type, hidden, critical, etc.
	 */
	constructor(
		attribute: string,
		amount: number,
		attacker: PlayerOrNpc,
		source: any,
		metadata: Partial<Record<string, unknown>> = {}
	) {
		if (!Number.isFinite(amount)) {
			throw new TypeError(
				`Damage amount must be a finite Number, got ${amount}.`
			);
		}

		if (typeof attribute !== 'string') {
			throw new TypeError('Damage attribute name must be a string');
		}

		this.attacker = attacker || null;
		this.attribute = attribute;
		this.amount = amount;
		this.source = source;
		this.metadata = metadata;
	}

	/**
	 * Evaluate actual damage taking attacker/target's effects into account
	 * @param {Character} target
	 * @return {number} Final damage amount
	 */
	evaluate(target: PlayerOrNpc): number {
		let amount = this.amount;

		if (this.attacker) {
			amount = this.attacker.evaluateOutgoingDamage(this, amount, target);
		}

		return target.evaluateIncomingDamage(this, amount, this.attacker || undefined);
	}

	/**
	 * Actually lower the attribute
	 * @param {Character} target
	 * @fires Character#hit
	 * @fires Character#damaged
	 */
	commit(target: PlayerOrNpc) {
		const finalAmount = this.evaluate(target);
		target.lowerAttribute(this.attribute, finalAmount);

		if (this.attacker) {
			/**
			 * @event Character#hit
			 * @param {Damage} damage
			 * @param {Character} target
			 * @param {Number} finalAmount
			 */
			this.attacker.emit('hit', this, target, finalAmount);
		}
		/**
		 * @event Character#damaged
		 * @param {Damage} damage
		 * @param {Number} finalAmount
		 */
		target.emit('damaged', this, finalAmount);
	}
}
