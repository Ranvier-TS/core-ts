import { EffectableEntity } from './EffectableEntity';
import { Metadata } from './Metadatable';
import { Player } from './Player';

export type AttributeName = string;

export interface IAttributeDef {
	name: AttributeName;
	base: number;
	metadata?: Metadata;
	formula: IAttributeFormulaDef;
}

export interface ISerializedAttribute {
	delta: number;
	base: number;
}
/**
 * Representation of an "Attribute" which is any value that has a base amount and depleted/restored
 * safely. Where safely means without being destructive to the base value.
 *
 * An attribute on its own cannot be raised above its base value. To raise attributes above their
 * base temporarily see the {@link https://ranviermud.com/coding/effects/|Effect guide}.
 *
 * @property {string} name
 * @property {number} base
 * @property {number} delta Current difference from the base
 * @property {AttributeFormula} formula
 * @property {object} metadata any custom info for this attribute
 */
export class Attribute {
	/** @property {AttributeName} name */
	name: AttributeName;
	/** @property {number} base */
	base: number;
	/** @property {number} delta Current difference from the base */
	delta: number = 0;
	/** @property {AttributeFormula} formula */
	formula: AttributeFormula | null = null;
	/** @property {object} metadata any custom info for this attribute */
	metadata: Metadata = {};

	/**
	 * @param {AttributeName} name
	 * @param {number} base
	 * @param {number} delta=0
	 * @param {AttributeFormula} formula=null
	 * @param {object} metadata={}
	 */
	constructor(
		name: AttributeName,
		base: number,
		delta: number,
		formula: AttributeFormula | null,
		metadata: Metadata
	) {
		if (isNaN(base)) {
			throw new TypeError(`Base attribute must be a number, got ${base}.`);
		}
		if (isNaN(delta)) {
			throw new TypeError(`Attribute delta must be a number, got ${delta}.`);
		}
		if (formula && !(formula instanceof AttributeFormula)) {
			throw new TypeError(
				'Attribute formula must be instance of AttributeFormula'
			);
		}

		this.name = name;
		this.base = base;
		this.delta = delta;
		this.formula = formula;
		this.metadata = metadata;
	}

	/**
	 * Lower current value
	 * @param {number} amount
	 */
	lower(amount: number) {
		this.raise(-amount);
	}

	/**
	 * Raise current value
	 * @param {number} amount
	 */
	raise(amount: number) {
		const newDelta = Math.min(this.delta + amount, 0);
		this.delta = newDelta;
	}

	/**
	 * Change the base value
	 * @param {number} amount
	 */
	setBase(amount: number) {
		this.base = Math.max(amount, 0);
	}

	/**
	 * Bypass raise/lower, directly setting the delta
	 * @param {number} amount
	 */
	setDelta(amount: number) {
		this.delta = Math.min(amount, 0);
	}

	serialize(): ISerializedAttribute {
		const { delta, base } = this;
		return { delta, base };
	}
}

export type AttributeFormulaExecutable = (
	this: Attribute,
	character: EffectableEntity,
	...attrs: number[]
) => number;

export interface IAttributeFormulaDef {
	requires?: AttributeName[];
	fn: AttributeFormulaExecutable;
}

/**
 * @property {Array<string>} requires Array of attributes required for this formula to run
 * @property {function (...number) : number} formula
 */
export class AttributeFormula {
	/** @property {Array<string>} requires Array of attributes required for this formula to run */
	requires: AttributeName[];
	/** @property {function (...number) : number} formula */
	formula: AttributeFormulaExecutable;

	constructor(requires: AttributeName[], fn: AttributeFormulaExecutable) {
		if (!Array.isArray(requires)) {
			throw new TypeError('requires not an array');
		}

		if (typeof fn !== 'function') {
			throw new TypeError('Formula function is not a function');
		}

		this.requires = requires;
		this.formula = fn;
	}

	evaluate(
		attribute: Attribute,
		character: EffectableEntity,
		...args: number[]
	) {
		if (typeof this.formula !== 'function') {
			throw new Error(`Formula is not callable ${this.formula}`);
		}

		return this.formula.bind(attribute)(character, ...args);
	}
}
