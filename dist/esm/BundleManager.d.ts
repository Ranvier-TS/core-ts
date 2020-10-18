import { IAreaDef } from './Area';
import { IAttributeDef } from './Attribute';
import { Command } from './Command';
import { EntityFactoryType } from './EntityFactory';
import { EntityLoaderKeys, EntityLoaderRegistry } from './EntityLoaderRegistry';
import { EntityReference } from './EntityReference';
import { EventListeners } from './EventManager';
import { IGameState } from './GameState';
export interface IListenersLoader {
    listeners: EventListeners;
}
export interface IEventLoader {
    event?: Function | ((state: IGameState) => Function);
}
/**
 * Handles loading/parsing/initializing all bundles. AKA where the magic happens
 */
export declare class BundleManager {
    state: IGameState;
    bundlesPath: string;
    areas: string[];
    loaderRegistry: EntityLoaderRegistry;
    /**
     * @param {string} path
     * @param {GameState} state
     */
    constructor(path: string, state: IGameState);
    /**
     * Load in all bundles
     * @param {boolean} distribute
     */
    loadBundles(distribute?: boolean): Promise<void>;
    /**
     * @param {string} bundle Bundle name
     * @param {string} bundlePath Path to bundle directory
     */
    loadBundle(bundle: string, bundlePath: string): Promise<void>;
    loadQuestGoals(bundle: string, goalsDir: string): void;
    loadQuestRewards(bundle: string, rewardsDir: string): void;
    /**
     * Load attribute definitions
     * @param {string} bundle
     * @param {string} attributesFile
     */
    loadAttributes(bundle: string, attributesFile: string): void;
    /**
     * Adds each attribute in the array if it fits the correct format.
     * @param {Array<Attribute>} attributes
     * @param {string} errorPrefix
     */
    addAttributes(attributes: IAttributeDef[], errorPrefix: string): void;
    /**
     * Load/initialize player. See the {@link http://ranviermud.com/extending/input_events/|Player Event guide}
     * @param {string} bundle
     * @param {string} eventsFile event js file to load
     */
    loadPlayerEvents(bundle: string, eventsFile: string): void;
    /**
     * @param {string} bundle
     */
    loadAreas(bundle: string): Promise<IAreaDef[] | undefined>;
    /**
     * @param {string} bundle
     * @param {string} areaName
     * @param {object} manifest
     */
    loadArea(bundle: string, areaName: string, manifest: IAreaDef): Promise<void>;
    /**
     * Load an entity (item/npc/room) from file
     * @param {string} bundle
     * @param {string} areaName
     * @param {string} type
     * @param {EntityFactory} factory
     * @return {Array<string>}
     */
    loadEntities(bundle: string, areaName: string, type: EntityLoaderKeys, factory: EntityFactoryType): Promise<any>;
    /**
     * @param {EntityFactory} factory Instance of EntityFactory that the item/npc will be loaded into
     * @param {string} entityRef
     * @param {string} scriptPath
     */
    loadEntityScript(factory: EntityFactoryType, entityRef: EntityReference, scriptPath: string): void;
    /**
     * @param {string} bundle
     * @param {string} areaName
     * @return {Promise<Array<string>>}
     */
    loadQuests(bundle: string, areaName: string): Promise<any>;
    /**
     * @param {string} bundle
     * @param {string} commandsDir
     */
    loadCommands(bundle: string, commandsDir: string): void;
    /**
     * @param {string} commandPath
     * @param {string} commandName
     * @param {string} bundle
     * @return {Command}
     */
    createCommand(commandPath: string, commandName: string, bundle: string): Command;
    /**
     * @param {string} bundle
     * @param {string} channelsFile
     */
    loadChannels(bundle: string, channelsFile: string): void;
    /**
     * @param {string} bundle
     */
    loadHelp(bundle: string): Promise<void>;
    /**
     * @param {string} bundle
     * @param {string} inputEventsDir
     */
    loadInputEvents(bundle: string, inputEventsDir: string): void;
    /**
     * @param {string} bundle
     * @param {string} behaviorsDir
     */
    loadBehaviors(bundle: string, behaviorsDir: string): void;
    /**
     * @param {string} bundle
     * @param {string} effectsDir
     */
    loadEffects(bundle: string, effectsDir: string): void;
    /**
     * @param {string} bundle
     * @param {string} skillsDir
     */
    loadSkills(bundle: string, skillsDir: string): void;
    /**
     * @param {string} bundle
     * @param {string} serverEventsDir
     */
    loadServerEvents(bundle: string, serverEventsDir: string): void;
    /**
     * For a given bundle js file require check if it needs to be backwards compatibly loaded with a loader(srcPath)
     * or can just be loaded on its own
     * @private
     * @param {function (string)|object|array} loader
     * @return {loader}
     */
    _getLoader<T>(loader: Function, ...args: any[]): T;
    /**
     * @private
     * @param {string} bundle
     * @param {string} type
     * @return {string}
     */
    _getAreaScriptPath(bundle: string, type: string): string;
}
