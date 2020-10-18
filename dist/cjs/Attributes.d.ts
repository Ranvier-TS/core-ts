import { Attribute, AttributeName, ISerializedAttribute } from './Attribute';
/**
 * Container for a list of attributes for a {@link Character}
 *
 * @extends Map
 */
export declare class Attributes extends Map<AttributeName, Attribute> {
    /**
     * @param {Attribute} attribute
     */
    add(attribute: Attribute): void;
    /**
     * @return {Iterator} see {@link Map#entries}
     */
    getAttributes(): IterableIterator<[string, Attribute]>;
    /**
     * Clear all deltas for all attributes in the list
     */
    clearDeltas(): void;
    /**
     * Gather data that will be persisted
     * @return {Object}
     */
    serialize(): Record<string, ISerializedAttribute>;
}
