"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Attribute_1 = require("./Attribute");
const Command_1 = require("./Command");
const Config_1 = require("./Config");
const Data_1 = require("./Data");
const EntityLoaderRegistry_1 = require("./EntityLoaderRegistry");
const Helpfile_1 = require("./Helpfile");
const Logger_1 = require("./Logger");
const QuestGoal_1 = require("./QuestGoal");
const QuestReward_1 = require("./QuestReward");
const Skill_1 = require("./Skill");
const SkillType_1 = require("./SkillType");
const srcPath = __dirname + '/';
/**
 * Handles loading/parsing/initializing all bundles. AKA where the magic happens
 */
class BundleManager {
    /**
     * @param {string} path
     * @param {GameState} state
     */
    constructor(path, state) {
        if (!path || !fs_1.default.existsSync(path)) {
            throw new Error('Invalid bundle path');
        }
        this.state = state;
        this.bundlesPath = path;
        this.areas = [];
        this.loaderRegistry = this.state.EntityLoaderRegistry;
    }
    /**
     * Load in all bundles
     * @param {boolean} distribute
     */
    async loadBundles(distribute = true) {
        Logger_1.Logger.verbose('LOAD: BUNDLES');
        const bundles = Config_1.Config.get('bundles');
        for (const bundle of bundles) {
            const bundlePath = this.bundlesPath + bundle;
            if ((fs_1.default.existsSync(bundlePath) && fs_1.default.statSync(bundlePath).isFile()) ||
                bundle === '.' ||
                bundle === '..') {
                continue;
            }
            await this.loadBundle(bundle, bundlePath);
        }
        try {
            this.state.AttributeFactory.validateAttributes();
        }
        catch (err) {
            Logger_1.Logger.error(err.message);
            process.exit(0);
        }
        Logger_1.Logger.verbose('ENDLOAD: BUNDLES');
        if (!distribute) {
            return;
        }
        // Distribution is done after all areas are loaded in case items use areas from each other
        for (const areaRef of this.areas) {
            const area = this.state.AreaFactory.create(areaRef);
            try {
                area.hydrate(this.state);
            }
            catch (err) {
                Logger_1.Logger.error(err.message);
                process.exit(0);
            }
            this.state.AreaManager.addArea(area);
        }
    }
    /**
     * @param {string} bundle Bundle name
     * @param {string} bundlePath Path to bundle directory
     */
    async loadBundle(bundle, bundlePath) {
        // prettier-ignore
        const features = [
            // quest goals/rewards have to be loaded before areas that have quests which use those goals
            { path: 'quest-goals/', fn: this.loadQuestGoals },
            { path: 'quest-rewards/', fn: this.loadQuestRewards },
            { path: 'attributes.js', fn: this.loadAttributes },
            // any entity in an area, including the area itself, can have behaviors so load them first
            { path: 'behaviors/', fn: this.loadBehaviors },
            { path: 'channels.js', fn: this.loadChannels },
            { path: 'commands/', fn: this.loadCommands },
            { path: 'effects/', fn: this.loadEffects },
            { path: 'input-events/', fn: this.loadInputEvents },
            { path: 'server-events/', fn: this.loadServerEvents },
            { path: 'player-events.js', fn: this.loadPlayerEvents },
            { path: 'skills/', fn: this.loadSkills },
        ];
        Logger_1.Logger.verbose(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] START`);
        for (const feature of features) {
            const path = bundlePath + '/' + feature.path;
            if (fs_1.default.existsSync(path)) {
                feature.fn(bundle, path);
            }
        }
        await this.loadAreas(bundle);
        await this.loadHelp(bundle);
        Logger_1.Logger.verbose(`ENDLOAD: BUNDLE [\x1B[1;32m${bundle}\x1B[0m]`);
    }
    loadQuestGoals(bundle, goalsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Quest Goals...`);
        const files = fs_1.default.readdirSync(goalsDir);
        for (const goalFile of files) {
            const goalPath = goalsDir + goalFile;
            if (!Data_1.Data.isScriptFile(goalPath, goalFile)) {
                continue;
            }
            const goalName = path_1.default.basename(goalFile, path_1.default.extname(goalFile));
            const loader = require(goalPath);
            let goalImport = QuestGoal_1.QuestGoal.isPrototypeOf(loader)
                ? loader
                : loader(srcPath);
            Logger_1.Logger.verbose(`\t\t${goalName}`);
            this.state.QuestGoalManager.set(goalName, goalImport);
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Quest Goals...`);
    }
    loadQuestRewards(bundle, rewardsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Quest Rewards...`);
        const files = fs_1.default.readdirSync(rewardsDir);
        for (const rewardFile of files) {
            const rewardPath = rewardsDir + rewardFile;
            if (!Data_1.Data.isScriptFile(rewardPath, rewardFile)) {
                continue;
            }
            const rewardName = path_1.default.basename(rewardFile, path_1.default.extname(rewardFile));
            const loader = require(rewardPath);
            let rewardImport = QuestReward_1.QuestReward.isPrototypeOf(loader)
                ? loader
                : loader(srcPath);
            Logger_1.Logger.verbose(`\t\t${rewardName}`);
            this.state.QuestRewardManager.set(rewardName, rewardImport);
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Quest Rewards...`);
    }
    /**
     * Load attribute definitions
     * @param {string} bundle
     * @param {string} attributesFile
     */
    loadAttributes(bundle, attributesFile) {
        Logger_1.Logger.verbose(`\tLOAD: Attributes...`);
        const attributes = require(attributesFile);
        const errorPrefix = `\tAttributes file [${attributesFile}] from bundle [${bundle}]`;
        if (!Array.isArray(attributes)) {
            Logger_1.Logger.error(`${errorPrefix} does not define an array of attributes`);
            return;
        }
        this.addAttributes(attributes, errorPrefix);
        Logger_1.Logger.verbose(`\tENDLOAD: Attributes...`);
    }
    /**
     * Adds each attribute in the array if it fits the correct format.
     * @param {Array<Attribute>} attributes
     * @param {string} errorPrefix
     */
    addAttributes(attributes, errorPrefix) {
        for (const attribute of attributes) {
            if (typeof attribute !== 'object') {
                Logger_1.Logger.error(`${attribute} not an object`);
                continue;
            }
            if (!('name' in attribute) || !('base' in attribute)) {
                Logger_1.Logger.error(`${errorPrefix} does not include required properties name and base`);
                continue;
            }
            let formula = null;
            if (attribute.formula) {
                formula = new Attribute_1.AttributeFormula(attribute.formula.requires || [], attribute.formula.fn);
            }
            Logger_1.Logger.verbose(`\t\t-> ${attribute.name}`);
            this.state.AttributeFactory.add(attribute.name, attribute.base, formula, attribute.metadata);
        }
    }
    /**
     * Load/initialize player. See the {@link http://ranviermud.com/extending/input_events/|Player Event guide}
     * @param {string} bundle
     * @param {string} eventsFile event js file to load
     */
    loadPlayerEvents(bundle, eventsFile) {
        Logger_1.Logger.verbose(`\tLOAD: Player Events...`);
        const loader = require(eventsFile);
        const playerListeners = this._getLoader(loader, srcPath)
            .listeners;
        for (const [eventName, listener] of Object.entries(playerListeners)) {
            Logger_1.Logger.verbose(`\t\tEvent: ${eventName}`);
            this.state.PlayerManager.addListener(eventName, listener(this.state));
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Player Events...`);
    }
    /**
     * @param {string} bundle
     */
    async loadAreas(bundle) {
        Logger_1.Logger.verbose(`\tLOAD: Areas...`);
        const areaLoader = this.loaderRegistry.get(EntityLoaderRegistry_1.EntityLoaderKeys.AREAS);
        areaLoader.setBundle(bundle);
        let areas = [];
        if (!(await areaLoader.hasData())) {
            return areas;
        }
        areas = await areaLoader.fetchAll();
        for (const name in areas) {
            const manifest = areas[name];
            this.areas.push(name);
            await this.loadArea(bundle, name, manifest);
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Areas`);
    }
    /**
     * @param {string} bundle
     * @param {string} areaName
     * @param {object} manifest
     */
    async loadArea(bundle, areaName, manifest) {
        const definition = {
            bundle,
            manifest,
            quests: [],
            items: [],
            npcs: [],
            rooms: [],
        };
        const scriptPath = this._getAreaScriptPath(bundle, 'area');
        if (manifest.script) {
            const areaScriptPath = `${scriptPath}/${manifest.script}.js`;
            if (!fs_1.default.existsSync(areaScriptPath)) {
                Logger_1.Logger.warn(`\t\t\t[${areaName}] has non-existent script "${manifest.script}"`);
            }
            Logger_1.Logger.verbose(`\t\t\tLoading Area Script for [${areaName}]: ${manifest.script}`);
            this.loadEntityScript(this.state.AreaFactory, areaName, areaScriptPath);
        }
        Logger_1.Logger.verbose(`\t\tLOAD: Quests...`);
        definition.quests = await this.loadQuests(bundle, areaName);
        Logger_1.Logger.verbose(`\t\tLOAD: Items...`);
        definition.items = await this.loadEntities(bundle, areaName, EntityLoaderRegistry_1.EntityLoaderKeys.ITEMS, this.state.ItemFactory);
        Logger_1.Logger.verbose(`\t\tLOAD: NPCs...`);
        definition.npcs = await this.loadEntities(bundle, areaName, EntityLoaderRegistry_1.EntityLoaderKeys.NPCS, this.state.MobFactory);
        Logger_1.Logger.verbose(`\t\tLOAD: Rooms...`);
        definition.rooms = await this.loadEntities(bundle, areaName, EntityLoaderRegistry_1.EntityLoaderKeys.ROOMS, this.state.RoomFactory);
        Logger_1.Logger.verbose('\t\tDone.');
        for (const npcRef of definition.npcs) {
            const npc = this.state.MobFactory.getDefinition(npcRef);
            if (!npc.quests) {
                continue;
            }
            // Update quest definitions with their questor
            // TODO: This currently means a given quest can only have a single questor, perhaps not optimal
            for (const qid of npc.quests) {
                const quest = this.state.QuestFactory.get(qid);
                if (!quest) {
                    Logger_1.Logger.error(`\t\t\tError: NPC is questor for non-existent quest [${qid}]`);
                    continue;
                }
                quest.npc = npcRef;
                this.state.QuestFactory.set(qid, quest);
            }
        }
        this.state.AreaFactory.setDefinition(areaName, definition);
    }
    /**
     * Load an entity (item/npc/room) from file
     * @param {string} bundle
     * @param {string} areaName
     * @param {string} type
     * @param {EntityFactory} factory
     * @return {Array<string>}
     */
    async loadEntities(bundle, areaName, type, factory) {
        const loader = this.loaderRegistry.get(type);
        loader.setBundle(bundle);
        loader.setArea(areaName);
        if (!(await loader.hasData())) {
            return [];
        }
        const entities = await loader.fetchAll();
        if (!entities) {
            Logger_1.Logger.warn(`\t\t\t${type} has an invalid value [${entities}]`);
            return [];
        }
        return entities.map((entity) => {
            const entityRef = factory.createEntityRef(areaName, entity.id);
            factory.setDefinition(entityRef, entity);
            if (entity.script !== undefined) {
                let scriptPath = '';
                switch (type) {
                    case EntityLoaderRegistry_1.EntityLoaderKeys.NPCS: {
                        scriptPath = this._getAreaScriptPath(bundle, 'npc');
                        break;
                    }
                    case EntityLoaderRegistry_1.EntityLoaderKeys.ITEMS: {
                        scriptPath = this._getAreaScriptPath(bundle, 'item');
                        break;
                    }
                    case EntityLoaderRegistry_1.EntityLoaderKeys.ROOMS: {
                        scriptPath = this._getAreaScriptPath(bundle, 'room');
                        break;
                    }
                }
                const entityScript = `${scriptPath}/${entity.script}.js`;
                if (!fs_1.default.existsSync(entityScript)) {
                    Logger_1.Logger.warn(`\t\t\t[${entityRef}] has non-existent script "${entity.script}"`);
                }
                else {
                    Logger_1.Logger.verbose(`\t\t\tLoading Script [${entityRef}] ${entity.script}`);
                    this.loadEntityScript(factory, entityRef, entityScript);
                }
            }
            return entityRef;
        });
    }
    /**
     * @param {EntityFactory} factory Instance of EntityFactory that the item/npc will be loaded into
     * @param {string} entityRef
     * @param {string} scriptPath
     */
    loadEntityScript(factory, entityRef, scriptPath) {
        const loader = require(scriptPath);
        const scriptListeners = this._getLoader(loader, srcPath)
            .listeners;
        for (const [eventName, listener] of Object.entries(scriptListeners)) {
            Logger_1.Logger.verbose(`\t\t\t\tEvent: ${eventName}`);
            factory.addScriptListener(entityRef, eventName, listener(this.state));
        }
    }
    /**
     * @param {string} bundle
     * @param {string} areaName
     * @return {Promise<Array<string>>}
     */
    async loadQuests(bundle, areaName) {
        const loader = this.loaderRegistry.get(EntityLoaderRegistry_1.EntityLoaderKeys.QUESTS);
        loader.setBundle(bundle);
        loader.setArea(areaName);
        let quests = [];
        try {
            quests = await loader.fetchAll();
        }
        catch (err) { }
        return quests.map((quest) => {
            Logger_1.Logger.verbose(`\t\t\tLoading Quest [${areaName}:${quest.id}]`);
            this.state.QuestFactory.add(areaName, quest.id, quest);
            return this.state.QuestFactory.makeQuestKey(areaName, quest.id);
        });
    }
    /**
     * @param {string} bundle
     * @param {string} commandsDir
     */
    loadCommands(bundle, commandsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Commands...`);
        const files = fs_1.default.readdirSync(commandsDir);
        for (const commandFile of files) {
            const commandPath = commandsDir + commandFile;
            if (!Data_1.Data.isScriptFile(commandPath, commandFile)) {
                continue;
            }
            const commandName = path_1.default.basename(commandFile, path_1.default.extname(commandFile));
            const command = this.createCommand(commandPath, commandName, bundle);
            this.state.CommandManager.add(command);
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Commands...`);
    }
    /**
     * @param {string} commandPath
     * @param {string} commandName
     * @param {string} bundle
     * @return {Command}
     */
    createCommand(commandPath, commandName, bundle) {
        const loader = require(commandPath);
        const cmdImport = this._getLoader(loader, srcPath, this.bundlesPath);
        cmdImport.command = cmdImport.command(this.state);
        return new Command_1.Command(bundle, commandName, cmdImport, commandPath);
    }
    /**
     * @param {string} bundle
     * @param {string} channelsFile
     */
    loadChannels(bundle, channelsFile) {
        Logger_1.Logger.verbose(`\tLOAD: Channels...`);
        const loader = require(channelsFile);
        let channels = this._getLoader(loader, srcPath);
        if (!Array.isArray(channels)) {
            channels = [channels];
        }
        channels.forEach((channel) => {
            channel.bundle = bundle;
            this.state.ChannelManager.add(channel);
        });
        Logger_1.Logger.verbose(`\tENDLOAD: Channels...`);
    }
    /**
     * @param {string} bundle
     */
    async loadHelp(bundle) {
        Logger_1.Logger.verbose(`\tLOAD: Help...`);
        const loader = this.loaderRegistry.get(EntityLoaderRegistry_1.EntityLoaderKeys.HELP);
        loader.setBundle(bundle);
        if (!(await loader.hasData())) {
            return;
        }
        const records = await loader.fetchAll();
        for (const helpName in records) {
            try {
                const hfile = new Helpfile_1.Helpfile(bundle, helpName, records[helpName].doc);
                const command = hfile.command && this.state.CommandManager.get(hfile.command);
                hfile.aliases = command ? command.aliases || [] : [];
                this.state.HelpManager.add(hfile);
            }
            catch (e) {
                Logger_1.Logger.warn(`\t\t${e.message}`);
                continue;
            }
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Help...`);
    }
    /**
     * @param {string} bundle
     * @param {string} inputEventsDir
     */
    loadInputEvents(bundle, inputEventsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Events...`);
        const files = fs_1.default.readdirSync(inputEventsDir);
        for (const eventFile of files) {
            const eventPath = inputEventsDir + eventFile;
            if (!Data_1.Data.isScriptFile(eventPath, eventFile)) {
                continue;
            }
            const eventName = path_1.default.basename(eventFile, path_1.default.extname(eventFile));
            const loader = require(eventPath);
            const eventImport = this._getLoader(loader, srcPath);
            if (typeof eventImport.event !== 'function') {
                throw new Error(`Bundle ${bundle} has an invalid input event '${eventName}'. Expected a function, got: ` +
                    eventImport.event);
            }
            this.state.InputEventManager.add(eventName, eventImport.event(this.state));
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Events...`);
    }
    /**
     * @param {string} bundle
     * @param {string} behaviorsDir
     */
    loadBehaviors(bundle, behaviorsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Behaviors...`);
        const loadEntityBehaviors = (type, manager, state) => {
            let typeDir = behaviorsDir + type + '/';
            if (!fs_1.default.existsSync(typeDir)) {
                return;
            }
            Logger_1.Logger.verbose(`\t\tLOAD: BEHAVIORS [${type}]...`);
            const files = fs_1.default.readdirSync(typeDir);
            for (const behaviorFile of files) {
                const behaviorPath = typeDir + behaviorFile;
                if (!Data_1.Data.isScriptFile(behaviorPath, behaviorFile)) {
                    continue;
                }
                const behaviorName = path_1.default.basename(behaviorFile, path_1.default.extname(behaviorFile));
                Logger_1.Logger.verbose(`\t\t\tLOAD: BEHAVIORS [${type}] ${behaviorName}...`);
                const loader = require(behaviorPath);
                const behaviorListeners = this._getLoader(loader, srcPath).listeners;
                for (const [eventName, listener] of Object.entries(behaviorListeners)) {
                    manager.addListener(behaviorName, eventName, listener(state));
                }
            }
        };
        loadEntityBehaviors('area', this.state.AreaBehaviorManager, this.state);
        loadEntityBehaviors('npc', this.state.MobBehaviorManager, this.state);
        loadEntityBehaviors('item', this.state.ItemBehaviorManager, this.state);
        loadEntityBehaviors('room', this.state.RoomBehaviorManager, this.state);
        Logger_1.Logger.verbose(`\tENDLOAD: Behaviors...`);
    }
    /**
     * @param {string} bundle
     * @param {string} effectsDir
     */
    loadEffects(bundle, effectsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Effects...`);
        const files = fs_1.default.readdirSync(effectsDir);
        for (const effectFile of files) {
            const effectPath = effectsDir + effectFile;
            if (!Data_1.Data.isScriptFile(effectPath, effectFile)) {
                continue;
            }
            const effectName = path_1.default.basename(effectFile, path_1.default.extname(effectFile));
            const loader = require(effectPath);
            const efectImport = this._getLoader(loader, srcPath);
            Logger_1.Logger.verbose(`\t\t${effectName}`);
            this.state.EffectFactory.add(effectName, efectImport, this.state);
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Effects...`);
    }
    /**
     * @param {string} bundle
     * @param {string} skillsDir
     */
    loadSkills(bundle, skillsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Skills...`);
        const files = fs_1.default.readdirSync(skillsDir);
        for (const skillFile of files) {
            const skillPath = skillsDir + skillFile;
            if (!Data_1.Data.isScriptFile(skillPath, skillFile)) {
                continue;
            }
            const skillName = path_1.default.basename(skillFile, path_1.default.extname(skillFile));
            const loader = require(skillPath);
            const skillImport = this._getLoader(loader, srcPath);
            if (skillImport.run) {
                skillImport.run = skillImport.run(this.state);
            }
            Logger_1.Logger.verbose(`\t\t${skillName}`);
            const skill = new Skill_1.Skill(skillName, skillImport, this.state);
            if (skill.type === SkillType_1.SkillType.SKILL) {
                this.state.SkillManager.add(skill);
            }
            else {
                this.state.SpellManager.add(skill);
            }
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Skills...`);
    }
    /**
     * @param {string} bundle
     * @param {string} serverEventsDir
     */
    loadServerEvents(bundle, serverEventsDir) {
        Logger_1.Logger.verbose(`\tLOAD: Server Events...`);
        const files = fs_1.default.readdirSync(serverEventsDir);
        for (const eventsFile of files) {
            const eventsPath = serverEventsDir + eventsFile;
            if (!Data_1.Data.isScriptFile(eventsPath, eventsFile)) {
                continue;
            }
            const eventsName = path_1.default.basename(eventsFile, path_1.default.extname(eventsFile));
            Logger_1.Logger.verbose(`\t\t\tLOAD: SERVER-EVENTS ${eventsName}...`);
            const loader = require(eventsPath);
            const eventsListeners = this._getLoader(loader, srcPath)
                .listeners;
            if (!eventsListeners) {
                continue;
            }
            for (const [eventName, listener] of Object.entries(eventsListeners)) {
                this.state.ServerEventManager.add(eventName, listener(this.state));
            }
        }
        Logger_1.Logger.verbose(`\tENDLOAD: Server Events...`);
    }
    /**
     * For a given bundle js file require check if it needs to be backwards compatibly loaded with a loader(srcPath)
     * or can just be loaded on its own
     * @private
     * @param {function (string)|object|array} loader
     * @return {loader}
     */
    _getLoader(loader, ...args) {
        if (typeof loader === 'function') {
            // backwards compatible for old module loader(srcPath)
            return loader(...args);
        }
        return loader;
    }
    /**
     * @private
     * @param {string} bundle
     * @param {string} type
     * @return {string}
     */
    _getAreaScriptPath(bundle, type) {
        return `${this.bundlesPath}/${bundle}/scripts/${type}`;
    }
}
exports.BundleManager = BundleManager;
