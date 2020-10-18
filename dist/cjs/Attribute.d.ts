import { EffectableEntity } from './EffectableEntity';
import { Metadata } from './Metadatable';
export declare type AttributeName = string;
export interface IAttributeDef {
    name: AttributeName;
    base: number;
    metadata: Metadata;
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
export declare class Attribute {
    /** @property {AttributeName} name */
    name: AttributeName;
    /** @property {number} base */
    base: number;
    /** @property {number} delta Current difference from the base */
    delta: number;
    /** @property {AttributeFormula} formula */
    formula: AttributeFormula | null;
    /** @property {object} metadata any custom info for this attribute */
    metadata: Metadata;
    /**
     * @param {AttributeName} name
     * @param {number} base
     * @param {number} delta=0
     * @param {AttributeFormula} formula=null
     * @param {object} metadata={}
     */
    constructor(name: AttributeName, base: number, delta: number, formula: AttributeFormula | null, metadata: Metadata);
    /**
     * Lower current value
     * @param {number} amount
     */
    lower(amount: number): void;
    /**
     * Raise current value
     * @param {number} amount
     */
    raise(amount: number): void;
    /**
     * Change the base value
     * @param {number} amount
     */
    setBase(amount: number): void;
    /**
     * Bypass raise/lower, directly setting the delta
     * @param {number} amount
     */
    setDelta(amount: number): void;
    serialize(): ISerializedAttribute;
}
export declare type AttributeFormulaExecutable = (character: EffectableEntity, ...attrs: number[]) => number;
export interface IAttributeFormulaDef {
    requires?: AttributeName[];
    fn: AttributeFormulaExecutable;
}
/**
 * @property {Array<string>} requires Array of attributes required for this formula to run
 * @property {function (...number) : number} formula
 */
export declare class AttributeFormula {
    /** @property {Array<string>} requires Array of attributes required for this formula to run */
    requires: AttributeName[];
    /** @property {function (...number) : number} formula */
    formula: AttributeFormulaExecutable;
    constructor(requires: AttributeName[], fn: AttributeFormulaExecutable);
    evaluate(attribute: Attribute, character: EffectableEntity, ...args: number[]): number;
}
