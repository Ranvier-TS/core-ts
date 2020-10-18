import { Attribute } from './Attribute';
/**
 * Container for a list of attributes for a {@link Character}
 *
 * @extends Map
 */
export class Attributes extends Map {
    /**
     * @param {Attribute} attribute
     */
    add(attribute) {
        if (!(attribute instanceof Attribute)) {
            throw new TypeError(`${attribute} not an Attribute`);
        }
        this.set(attribute.name, attribute);
    }
    /**
     * @return {Iterator} see {@link Map#entries}
     */
    getAttributes() {
        return this.entries();
    }
    /**
     * Clear all deltas for all attributes in the list
     */
    clearDeltas() {
        for (const [_, attr] of this) {
            attr.setDelta(0);
        }
    }
    /**
     * Gather data that will be persisted
     * @return {Object}
     */
    serialize() {
        const data = {};
        [...this].forEach((attributeObj) => {
            const [name, attribute] = attributeObj;
            data[name] = attribute.serialize();
        });
        return data;
    }
}
