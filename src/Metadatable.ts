import { Constructor } from './Util';

/**
 * @ignore
 * @exports MetadatableFn
 * @param {*} parentClass
 * @return {module:MetadatableFn~Metadatable}
 */
export type Metadata = Record<string, any>;

export function Metadatable<TBase extends Constructor>(ParentClass: TBase) {
	/**
	 * Mixin for objects which have a `metadata` property
	 * @mixin
	 * @alias module:MetadatableFn~Metadatable
	 */
	return class extends ParentClass {
		metadata?: Metadata;
		/**
		 * Set a metadata value.
		 * Warning: Does _not_ autovivify, you will need to create the parent objects if they don't exist
		 * @param {string} key   Key to set. Supports dot notation e.g., `"foo.bar"`
		 * @param {*}      value Value must be JSON.stringify-able
		 * @throws Error
		 * @throws RangeError
		 * @fires Metadatable#metadataUpdate
		 */
		setMeta(key: string, value: any) {
			if (!this.metadata) {
				throw new Error('Class does not have metadata property');
			}

			let parts = key.split('.');
			const property = parts.pop();
			let base = this.metadata;

			if (!property) {
				throw new RangeError(`Metadata path invalid: ${property}`);
			}

			while (parts.length) {
				let part = parts.shift();
				if (!part || !(part in base)) {
					throw new RangeError(`Metadata path invalid: ${key}`);
				}
				base = base[part];
			}

			const oldValue = base[property];

			if (value === oldValue) {
				return;
			}

			base[property] = value;

			/**
			 * @event Metadatable#metadataUpdate
			 * @param {string} key
			 * @param {*} newValue
			 * @param {*} oldValue
			 */
			this.emit('metadataUpdated', key, value, oldValue);
		}

		/**
		 * Get metadata by dot notation
		 * Warning: This method is _very_ permissive and will not error on a non-existent key. Rather, it will return false.
		 * @param {string} key Key to fetch. Supports dot notation e.g., `"foo.bar"`
		 * @return {*}
		 * @throws Error
		 */
		getMeta(key: string) {
			if (!this.metadata) {
				throw new Error('Class does not have metadata property');
			}

			const base = this.metadata;
			return key.split('.').reduce((obj, index) => obj && obj[index], base);
		}
	};
}