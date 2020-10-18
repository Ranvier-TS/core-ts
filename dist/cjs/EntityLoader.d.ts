export interface IEntityLoaderConfig {
    area?: string;
    bundle?: string;
    path?: string;
    db?: string;
}
export interface IDataSource {
    name: string;
    resolvePath(config: {
        path: string;
        bundle: string;
        area: string;
    }): string;
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
export declare class EntityLoader {
    dataSource: IDataSource;
    config: IEntityLoaderConfig;
    /**
     * @param {DataSource}
     * @param {object} config
     */
    constructor(dataSource: IDataSource, config?: IEntityLoaderConfig);
    setArea(name: string): void;
    setBundle(name: string): void;
    hasData(): Promise<any>;
    fetchAll(): Promise<any>;
    fetch(id: string | number): any;
    replace(data: any): void;
    update(id: string | number, data: any): void;
    delete(id: string | number): void;
}
