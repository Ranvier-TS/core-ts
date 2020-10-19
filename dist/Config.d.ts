/**
 * Access class for the `ranvier.json` config
 */
export declare class Config {
    /**
     * @param {string} key
     * @param {*} fallback fallback value
     */
    static get(key: string, fallback?: number | string | object): any;
    /**
     * Load `ranvier.json` from disk
     */
    static load(data: object): void;
}
