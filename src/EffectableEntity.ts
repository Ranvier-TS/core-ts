import { EventEmitter } from 'events';
import { Attribute } from './Attribute';
import { Attributes } from './Attributes';
import { Damage } from './Damage';
import { Effect, ISerializedEffect } from './Effect';
import { EffectList } from './EffectList';
import { IGameState } from './GameState';
import { Logger } from './Logger';

export interface ISerializedEffectableEntity {
	attributes: Attributes;
	effects: ISerializedEffect[];
}

/**
 * @ignore
 * @exports MetadatableFn
 * @param {*} parentClass
 * @return {module:MetadatableFn~Metadatable}
 * Base class for game entities that can have effects/attributes
 * @extends EventEmitter
 */
export class EffectableEntity extends EventEmitter {
	effects: EffectList;
	attributes: Attributes;
	__hydrated: boolean;
	constructor(data: ISerializedEffectableEntity) {
		super();

		this.attributes = Object.assign({}, data.attributes) || new Attributes();
		this.effects = new EffectList(this, data.effects);
		this.__hydrated = false;
	}

	/**
	 * Proxy all events on the entity to effects
	 * @param {string} event
	 * @param {...*}   args
	 */
	emit(event: string, ...args: any[]) {
		super.emit(event, ...args);

		this.effects.emit(event, ...args);

		return true;
	}

	/**
	 * @param {string} attr Attribute name
	 * @return {boolean}
	 */
	hasAttribute(attr: string) {
		return this.attributes.has(attr);
	}

	/**
	 * Get current maximum value of attribute (as modified by effects.)
	 * @param {string} attr
	 * @return {number}
	 */
	getMaxAttribute(attrString: string) {
		if (!this.hasAttribute(attrString)) {
			throw new RangeError(`Entity does not have attribute [${attrString}]`);
		}

		const attribute = this.attributes.get(attrString);
		if (!attribute) {
			throw new RangeError(`Entity does not have attribute [${attrString}]`);
		}
		const currentVal = this.effects.evaluateAttribute(attribute);

		if (!attribute.formula) {
			return currentVal;
		}

		const { formula } = attribute;

		const requiredValues: number[] = formula.requires.map((reqAttr) =>
			this.getMaxAttribute(reqAttr)
		);

		return formula.evaluate.apply(formula, [
			attribute,
			this,
			currentVal,
			...requiredValues,
		]);
	}

	/**
	 * @see {@link Attributes#add}
	 */
	addAttribute(attr: Attribute) {
		this.attributes.add(attr);
	}

	/**
	 * Get the current value of an attribute (base modified by delta)
	 * @param {string} attrString
	 * @return {number}
	 */
	getAttribute(attrString: string) {
		if (!this.attributes || !this.hasAttribute(attrString)) {
			throw new RangeError(`Entity does not have attribute [${attrString}]`);
		}
		const delta = this?.attributes?.get(attrString)?.delta || 0

		return this.getMaxAttribute(attrString) + delta;
	}

	/**
	 * Get the effected value of a given property
	 * @param {string} propertyName
	 * @return {*}
	 */
	getProperty(propertyName: string) {
		if (!(propertyName in this)) {
			throw new RangeError(
				`Cannot evaluate uninitialized property [${propertyName}]`
			);
		}

		//@ts-ignore
		let propertyValue = this[propertyName];

		// deep copy non-scalar property values to prevent modifiers from actually
		// changing the original value
		if (
			typeof propertyValue === 'function' ||
			typeof propertyValue === 'object'
		) {
			propertyValue = JSON.parse(JSON.stringify(propertyValue));
		}

		return this.effects.evaluateProperty(propertyName, propertyValue);
	}

	/**
	 * Get the base value for a given attribute
	 * @param {string} attrName Attribute name
	 * @return {number}
	 */
	getBaseAttribute(attrName: string) {
		const attr = this.attributes.get(attrName);
		return attr && attr.base;
	}

	/**
	 * Fired when an Entity's attribute is set, raised, or lowered
	 * @event EffectableEntity#attributeUpdate
	 * @param {string} attributeName
	 * @param {Attribute} attribute
	 */

	/**
	 * Clears any changes to the attribute, setting it to its base value.
	 * @param {string} attrString
	 * @fires EffectableEntity#attributeUpdate
	 */
	setAttributeToMax(attrString: string) {
		if (!this.hasAttribute(attrString)) {
			throw new Error(`Invalid attribute ${attrString}`);
		}

		this.attributes.get(attrString)?.setDelta(0);
		this.emit('attributeUpdate', attrString, this.getAttribute(attrString));
	}

	/**
	 * Raise an attribute by name
	 * @param {string} attr
	 * @param {number} amount
	 * @see {@link Attributes#raise}
	 * @fires EffectableEntity#attributeUpdate
	 */
	raiseAttribute(attrString: string, amount: number) {
		if (!this.hasAttribute(attrString)) {
			throw new Error(`Invalid attribute ${attrString}`);
		}

		this.attributes.get(attrString)?.raise(amount);
		this.emit('attributeUpdate', attrString, this.getAttribute(attrString));
	}

	/**
	 * Lower an attribute by name
	 * @param {string} attr
	 * @param {number} amount
	 * @see {@link Attributes#lower}
	 * @fires EffectableEntity#attributeUpdate
	 */
	lowerAttribute(attrString: string, amount: number) {
		if (!this.hasAttribute(attrString)) {
			throw new Error(`Invalid attribute ${attrString}`);
		}

		this.attributes.get(attrString)?.lower(amount);
		this.emit('attributeUpdate', attrString, this.getAttribute(attrString));
	}

	/**
	 * Update an attribute's base value.
	 *
	 * NOTE: You _probably_ don't want to use this the way you think you do. You should not use this
	 * for any temporary modifications to an attribute, instead you should use an Effect modifier.
	 *
	 * This will _permanently_ update the base value for an attribute to be used for things like a
	 * player purchasing a permanent upgrade or increasing a stat on level up
	 *
	 * @param {string} attr Attribute name
	 * @param {number} newBase New base value
	 * @fires EffectableEntity#attributeUpdate
	 */
	setAttributeBase(attrString: string, newBase: number) {
		if (!this.hasAttribute(attrString)) {
			throw new Error(`Invalid attribute ${attrString}`);
		}

		this.attributes.get(attrString)?.setBase(newBase);
		this.emit('attributeUpdate', attrString, this.getAttribute(attrString));
	}

	/**
	 * @param {string} type
	 * @return {boolean}
	 * @see {@link Effect}
	 */
	hasEffectType(type: string) {
		return this.effects.hasEffectType(type);
	}

	/**
	 * @param {Effect} effect
	 * @return {boolean}
	 */
	addEffect(effect: Effect) {
		return this.effects.add(effect);
	}

	/**
	 * @param {Effect} effect
	 * @see {@link Effect#remove}
	 */
	removeEffect(effect: Effect) {
		this.effects.remove(effect);
	}

	/**
	 * @see EffectList.evaluateIncomingDamage
	 * @param {Damage} damage
	 * @return {number}
	 */
	evaluateIncomingDamage(damage: Damage, currentAmount: number) {
		let amount = this.effects.evaluateIncomingDamage(damage, currentAmount);
		return Math.floor(amount);
	}

	/**
	 * @see EffectList.evaluateOutgoingDamage
	 * @param {Damage} damage
	 * @param {number} currentAmount
	 * @return {number}
	 */
	evaluateOutgoingDamage(damage: Damage, currentAmount: number) {
		return this.effects.evaluateOutgoingDamage(damage, currentAmount);
	}

	/**
	 * Initialize the entity from storage
	 * @param {GameState} state
	 */
	hydrate(state: IGameState, serialized = {}) {
		if (this.__hydrated) {
			Logger.warn('Attempted to hydrate already hydrated entity.');
			return;
		}

		if (!(this.attributes instanceof Attributes)) {
			const attributes = (this.attributes as any);
			this.attributes = new Attributes();

			for (const attr in attributes) {
				let attrConfig = attributes[attr];
				if (typeof attrConfig === 'number') {
					attrConfig = { base: attrConfig };
				}

				if (typeof attrConfig !== 'object' || !('base' in attrConfig)) {
					throw new Error(
						'Invalid base value given to attributes.\n' +
							JSON.stringify(attributes, null, 2)
					);
				}

				if (!state.AttributeFactory.has(attr)) {
					throw new Error(
						`Entity trying to hydrate with invalid attribute ${attr}`
					);
				}

				this.addAttribute(
					state.AttributeFactory.create(
						attr,
						attrConfig.base,
						attrConfig.delta || 0
					)
				);
			}
		}

		this.effects.hydrate(state);

		// inventory is hydrated in the subclasses because npc and players hydrate their inventories differently

		this.__hydrated = true;
	}

	/**
	 * Gather data to be persisted
	 * @return {Object}
	 */
	serialize() {
		return {
			attributes: this.attributes.serialize(),
			effects: this.effects.serialize(),
		};
	}
}
