"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeFactory = void 0;
const Attribute_1 = require("./Attribute");
/**
 * @property {Map} attributes
 */
class AttributeFactory {
    constructor() {
        this.attributes = new Map();
    }
    /**
     * @param {string} name
     * @param {number} base
     * @param {AttributeFormula} formula
     */
    add(name, base, formula = null, metadata = {}) {
        if (formula && !(formula instanceof Attribute_1.AttributeFormula)) {
            throw new TypeError('Formula not instance of AttributeFormula');
        }
        this.attributes.set(name, {
            name,
            base,
            formula,
            metadata,
        });
    }
    /**
     * @see Map#has
     */
    has(name) {
        return this.attributes.has(name);
    }
    /**
     * Get a attribute definition. Use `create` if you want an instance of a attribute
     * @param {string} name
     * @return {object}
     */
    get(name) {
        return this.attributes.get(name);
    }
    /**
     * @param {string} name
     * @param {number} base
     * @param {number} delta
     * @return {Attribute}
     */
    create(name, base = null, delta = 0) {
        const def = this.attributes.get(name);
        if (!def) {
            throw new RangeError(`No attribute definition found for [${name}]`);
        }
        return new Attribute_1.Attribute(name, base || def.base, delta, def.formula, def.metadata);
    }
    /**
     * Make sure there are no circular dependencies between attributes
     * @throws Error
     */
    validateAttributes() {
        const references = {};
        [...this.attributes].reduce((acc, [attrName, { formula }]) => {
            if (!formula) {
                return acc;
            }
            acc[attrName] = formula.requires;
            return acc;
        }, references);
        for (const attrName in references) {
            const check = this.checkReferences(attrName, references);
            if (Array.isArray(check)) {
                const path = check.concat(attrName).join(' -> ');
                throw new Error(`Attribute formula for [${attrName}] has circular dependency [${path}]`);
            }
        }
    }
    /**
     * @private
     * @param {string} attr attribute name to check for circular ref
     * @param {Object.<string, Array<string>>} references
     * @param {Array<string>} stack
     * @return bool
     */
    checkReferences(attr, references, stack = []) {
        if (stack.includes(attr)) {
            return stack;
        }
        const requires = references[attr];
        if (!requires || !requires.length) {
            return true;
        }
        for (const reqAttr of requires) {
            const check = this.checkReferences(reqAttr, references, stack.concat(attr));
            if (Array.isArray(check)) {
                return check;
            }
        }
        return true;
    }
}
exports.AttributeFactory = AttributeFactory;
