export interface IEntityLoaderConfig {
	area?: string;
	bundle?: string;
	path?: string;
	db?: string;
}

export interface IDataSource {
	name: string;
	resolvePath(config: { path: string; bundle: string; area: string }): string;
	hasData(config: IEntityLoaderConfig): Promise<any>;
	fetchAll?(config: IEntityLoaderConfig): Promise<any>;
	fetch?(config: IEntityLoaderConfig, id: string | number): any;
	replace?(config: IEntityLoaderConfig, data: any): void;
	update?(config: IEntityLoaderConfig, id: string | number, data: any): void;
	delete?(config: IEntityLoaderConfig, id: string | number): void;
}

/**
 * Used to CRUD an entity from a configured DataSource
 */
export class EntityLoader {
	dataSource: IDataSource;
	config: IEntityLoaderConfig;

	/**
	 * @param {DataSource}
	 * @param {object} config
	 */
	constructor(dataSource: IDataSource, config: IEntityLoaderConfig = {}) {
		this.dataSource = dataSource;
		this.config = config;
	}

	setArea(name: string) {
		this.config.area = name;
	}

	setBundle(name: string) {
		this.config.bundle = name;
	}

	hasData(): Promise<any> {
		return this.dataSource.hasData(this.config);
	}

	fetchAll(): Promise<any> {
		if (!this.dataSource.fetchAll) {
			throw new Error(`fetchAll not supported by ${this.dataSource.name}`);
		}

		return this.dataSource.fetchAll(this.config);
	}

	fetch(id: string | number) {
		if (!this.dataSource.fetch) {
			throw new Error(`fetch not supported by ${this.dataSource.name}`);
		}

		return this.dataSource.fetch(this.config, id);
	}

	replace(data: any) {
		if (!this.dataSource.replace) {
			throw new Error(`replace not supported by ${this.dataSource.name}`);
		}

		return this.dataSource.replace(this.config, data);
	}

	update(id: string | number, data: any) {
		if (!this.dataSource.update) {
			throw new Error(`update not supported by ${this.dataSource.name}`);
		}

		return this.dataSource.update(this.config, id, data);
	}

	delete(id: string | number) {
		if (!this.dataSource.delete) {
			throw new Error(`delete not supported by ${this.dataSource.name}`);
		}

		return this.dataSource.delete(this.config, id);
	}
}
