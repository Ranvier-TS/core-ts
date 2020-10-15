let __cache: any = null;

/**
 * Access class for the `ranvier.json` config
 */
export class Config {
	/**
	 * @param {string} key
	 * @param {*} fallback fallback value
	 */
	static get(key: string, fallback?: number | string | object) {
		return key in __cache ? __cache[key] : fallback;
	}

	/**
	 * Load `ranvier.json` from disk
	 */
	static load(data: object) {
		__cache = data;
	}
}
