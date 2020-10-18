import { Constructor } from './Util';
/**
 * @ignore
 * @exports MetadatableFn
 * @param {*} parentClass
 * @return {module:MetadatableFn~Metadatable}
 */
export declare type Metadata = Record<string, any>;
export declare function Metadatable<TBase extends Constructor>(ParentClass: TBase): {
    new (...args: any[]): {
        metadata?: Record<string, any> | undefined;
        /**
         * Set a metadata value.
         * Warning: Does _not_ autovivify, you will need to create the parent objects if they don't exist
         * @param {string} key   Key to set. Supports dot notation e.g., `"foo.bar"`
         * @param {*}      value Value must be JSON.stringify-able
         * @throws Error
         * @throws RangeError
         * @fires Metadatable#metadataUpdate
         */
        setMeta(key: string, value: any): void;
        /**
         * Get metadata by dot notation
         * Warning: This method is _very_ permissive and will not error on a non-existent key. Rather, it will return false.
         * @param {string} key Key to fetch. Supports dot notation e.g., `"foo.bar"`
         * @return {*}
         * @throws Error
         */
        getMeta(key: string): Record<string, any>;
        addListener(event: string | symbol, listener: (...args: any[]) => void): any;
        on(event: string | symbol, listener: (...args: any[]) => void): any;
        once(event: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
        off(event: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(event: string | symbol): Function[];
        rawListeners(event: string | symbol): Function[];
        emit(event: string | symbol, ...args: any[]): boolean;
        listenerCount(type: string | symbol): number;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
} & TBase;
