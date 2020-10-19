import { Attribute, AttributeFormula, IAttributeDef } from './Attribute';
declare type OmitFormula = Omit<IAttributeDef, 'formula'>;
export interface AttributeFactoryAttribute extends OmitFormula {
    formula: AttributeFormula | null;
}
/**
 * @property {Map} attributes
 */
export declare class AttributeFactory {
    /** @property {Map} attributes */
    attributes: Map<string, AttributeFactoryAttribute>;
    constructor();
    /**
     * @param {string} name
     * @param {number} base
     * @param {AttributeFormula} formula
     */
    add(name: string, base: number, formula?: AttributeFormula | null, metadata?: {}): void;
    /**
     * @see Map#has
     */
    has(name: string): boolean;
    /**
     * Get a attribute definition. Use `create` if you want an instance of a attribute
     * @param {string} name
     * @return {object}
     */
    get(name: string): AttributeFactoryAttribute | undefined;
    /**
     * @param {string} name
     * @param {number} base
     * @param {number} delta
     * @return {Attribute}
     */
    create(name: string, base?: number | null, delta?: number): Attribute;
    /**
     * Make sure there are no circular dependencies between attributes
     * @throws Error
     */
    validateAttributes(): void;
    /**
     * @private
     * @param {string} attr attribute name to check for circular ref
     * @param {Object.<string, Array<string>>} references
     * @param {Array<string>} stack
     * @return bool
     */
    private checkReferences;
}
export {};
