import { IDataSource } from "./EntityLoader";

export interface DataSourceConfig {
	require?: string;
	config?: object;
}

/**
 * Holds instances of configured DataSources
 * @type {Map<string, DataSource>}
 */
export class DataSourceRegistry extends Map<string, IDataSource> {
	/**
	 * @param {Function} requireFn used to require() the loader
	 * @param {string} rootPath project root
	 * @param {object} config configuration to load
	 */
	load(requireFn: Function, rootPath: string, config: DataSourceConfig = {}) {
		for (const [name, settings] of Object.entries(config)) {
			if (!settings.hasOwnProperty('require')) {
				throw new Error(`DataSource [${name}] does not specify a 'require'`);
			}

			if (typeof settings.require !== 'string') {
				throw new TypeError(`DataSource [${name}] has an invalid 'require'`);
			}

			const sourceConfig = settings.config || {};

			let loader = null;

			// relative path to require
			if (settings.require[0] === '.') {
				loader = require(rootPath + '/' + settings.require);
			} else if (!settings.require.includes('.')) {
				loader = require(settings.require);
			} else {
				const [moduleName, exportName] = settings.require.split('.');
				loader = requireFn(moduleName)[exportName];
			}

			const instance: IDataSource = new loader(sourceConfig, rootPath);
			if (!('hasData' in instance)) {
				throw new Error(
					`Data Source ${name} requires at minimum a 'hasData(config): boolean' method`
				);
			}
			instance.name = name;

			this.set(name, instance);
		}
	}
}
