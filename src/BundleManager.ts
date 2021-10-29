import fs from 'fs';
import path from 'path';
import { IAreaDef, IAreaManifest } from './Area';
import { AttributeFormula, IAttributeDef } from './Attribute';
import { BehaviorManager } from './BehaviorManager';
import { Channel, IChannelLoader } from './Channel';
import { Command, ICommandDef } from './Command';
import { Config } from './Config';
import { Data } from './Data';
import { IEffectDef } from './Effect';
import { EntityFactoryType } from './EntityFactory';
import { EntityLoaderKeys, EntityLoaderRegistry } from './EntityLoaderRegistry';
import { EntityReference } from './EntityReference';
import { EventListeners } from './EventManager';
import { GameEntities, GameEntityDefinition } from './GameEntity';
import { IGameState } from './GameState';
import { Helpfile } from './Helpfile';
import { Logger } from './Logger';
import { IQuestDef } from './Quest';
import { QuestGoal } from './QuestGoal';
import { QuestReward } from './QuestReward';
import { ISkillOptions, Skill } from './Skill';
import { SkillType } from './SkillType';

export interface IListenersLoader {
	listeners: EventListeners;
}

export interface IEventLoader {
	event?: Function | ((state: IGameState) => Function);
}

const srcPath = __dirname + '/';
/**
 * Handles loading/parsing/initializing all bundles. AKA where the magic happens
 */
export class BundleManager {
	state: IGameState;
	bundlesPath: string;
	areas: string[];
	loaderRegistry: EntityLoaderRegistry;
	/**
	 * @param {string} path
	 * @param {GameState} state
	 */
	constructor(path: string, state: IGameState) {
		if (!path || !fs.existsSync(path)) {
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
		Logger.verbose('LOAD: BUNDLES');

		const bundles = Config.get('bundles');
		for (const bundle of bundles) {
			const bundlePath = this.bundlesPath + bundle;
			if (
				(fs.existsSync(bundlePath) && fs.statSync(bundlePath).isFile()) ||
				bundle === '.' ||
				bundle === '..'
			) {
				continue;
			}

			await this.loadBundle(bundle, bundlePath);
		}

		try {
			this.state.AttributeFactory.validateAttributes();
		} catch (err: any) {
			Logger.error(err?.message);
			process.exit(0);
		}

		Logger.verbose('ENDLOAD: BUNDLES');

		if (!distribute) {
			return;
		}

		// Distribution is done after all areas are loaded in case items use areas from each other
		for (const areaRef of this.areas) {
			const area = this.state.AreaFactory.create(areaRef);
			try {
				area.hydrate(this.state);
			} catch (err) {
				Logger.error(err);
				process.exit(0);
			}
			this.state.AreaManager.addArea(area);
		}
	}

	/**
	 * @param {string} bundle Bundle name
	 * @param {string} bundlePath Path to bundle directory
	 */
	async loadBundle(bundle: string, bundlePath: string) {
		// prettier-ignore
		const features = [
			// quest goals/rewards have to be loaded before areas that have quests which use those goals
			{ path: 'quest-goals/',      fn: this.loadQuestGoals },
			{ path: 'quest-rewards/',    fn: this.loadQuestRewards },
			{ path: 'attributes.js',     fn: this.loadAttributes },
			// any entity in an area, including the area itself, can have behaviors so load them first
			{ path: 'behaviors/',        fn: this.loadBehaviors },
			{ path: 'channels.js',       fn: this.loadChannels },
			{ path: 'commands/',         fn: this.loadCommands },
			{ path: 'effects/',          fn: this.loadEffects },
			{ path: 'input-events/',     fn: this.loadInputEvents },
			{ path: 'server-events/',    fn: this.loadServerEvents },
			{ path: 'player-events.js',  fn: this.loadPlayerEvents },
			{ path: 'skills/',           fn: this.loadSkills },
		];

		Logger.verbose(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] START`);
		for (const feature of features) {
			const path = bundlePath + '/' + feature.path;
			if (fs.existsSync(path)) {
				feature.fn.call(this, bundle, path);
			}
		}

		await this.loadAreas(bundle);
		await this.loadHelp(bundle);

		Logger.verbose(`ENDLOAD: BUNDLE [\x1B[1;32m${bundle}\x1B[0m]`);
	}

	loadQuestGoals(bundle: string, goalsDir: string) {
		Logger.verbose(`\tLOAD: Quest Goals...`);
		const files = fs.readdirSync(goalsDir);

		for (const goalFile of files) {
			const goalPath = goalsDir + goalFile;
			if (!Data.isScriptFile(goalPath, goalFile)) {
				continue;
			}

			const goalName = path.basename(goalFile, path.extname(goalFile));
			const loader = require(goalPath);
			let goalImport = QuestGoal.isPrototypeOf(loader)
				? loader
				: loader(srcPath);
			Logger.verbose(`\t\t${goalName}`);

			this.state.QuestGoalManager.set(goalName, goalImport);
		}

		Logger.verbose(`\tENDLOAD: Quest Goals...`);
	}

	loadQuestRewards(bundle: string, rewardsDir: string) {
		Logger.verbose(`\tLOAD: Quest Rewards...`);
		const files = fs.readdirSync(rewardsDir);

		for (const rewardFile of files) {
			const rewardPath = rewardsDir + rewardFile;
			if (!Data.isScriptFile(rewardPath, rewardFile)) {
				continue;
			}

			const rewardName = path.basename(rewardFile, path.extname(rewardFile));
			const loader = require(rewardPath);
			let rewardImport = QuestReward.isPrototypeOf(loader)
				? loader
				: loader(srcPath);
			Logger.verbose(`\t\t${rewardName}`);

			this.state.QuestRewardManager.set(rewardName, rewardImport);
		}

		Logger.verbose(`\tENDLOAD: Quest Rewards...`);
	}

	/**
	 * Load attribute definitions
	 * @param {string} bundle
	 * @param {string} attributesFile
	 */
	loadAttributes(bundle: string, attributesFile: string) {
		Logger.verbose(`\tLOAD: Attributes...`);

		const attributes: IAttributeDef[] = require(attributesFile);
		const errorPrefix = `\tAttributes file [${attributesFile}] from bundle [${bundle}]`;
		if (!Array.isArray(attributes)) {
			Logger.error(`${errorPrefix} does not define an array of attributes`);
			return;
		}

		this.addAttributes(attributes, errorPrefix);

		Logger.verbose(`\tENDLOAD: Attributes...`);
	}

	/**
	 * Adds each attribute in the array if it fits the correct format.
	 * @param {Array<Attribute>} attributes
	 * @param {string} errorPrefix
	 */
	addAttributes(attributes: IAttributeDef[], errorPrefix: string) {
		for (const attribute of attributes) {
			if (typeof attribute !== 'object') {
				Logger.error(`${attribute} not an object`);
				continue;
			}

			if (!('name' in attribute) || !('base' in attribute)) {
				Logger.error(
					`${errorPrefix} does not include required properties name and base`
				);
				continue;
			}

			let formula: AttributeFormula | null = null;
			if (attribute.formula) {
				formula = new AttributeFormula(
					attribute.formula.requires || [],
					attribute.formula.fn
				);
			}

			Logger.verbose(`\t\t-> ${attribute.name}`);

			this.state.AttributeFactory.add(
				attribute.name,
				attribute.base,
				formula,
				attribute.metadata
			);
		}
	}

	/**
	 * Load/initialize player. See the {@link http://ranviermud.com/extending/input_events/|Player Event guide}
	 * @param {string} bundle
	 * @param {string} eventsFile event js file to load
	 */
	loadPlayerEvents(bundle: string, eventsFile: string) {
		Logger.verbose(`\tLOAD: Player Events...`);

		const loader = require(eventsFile);
		const playerListeners = this._getLoader<IListenersLoader>(
			loader,
			srcPath
		).listeners;

		for (const [eventName, listener] of Object.entries(playerListeners)) {
			Logger.verbose(`\t\tEvent: ${eventName}`);
			this.state.PlayerManager.addListener(eventName, listener(this.state));
		}

		Logger.verbose(`\tENDLOAD: Player Events...`);
	}

	/**
	 * @param {string} bundle
	 */
	async loadAreas(bundle: string) {
		Logger.verbose(`\tLOAD: Areas...`);

		const areaLoader = this.loaderRegistry.get(EntityLoaderKeys.AREAS);
		areaLoader.setBundle(bundle);
		let areas: IAreaManifest[] = [];

		if (!(await areaLoader.hasData())) {
			return areas;
		}

		areas = await areaLoader.fetchAll();

		for (const name in areas) {
			const manifest = areas[name];
			this.areas.push(name);
			await this.loadArea(bundle, name, manifest);
		}

		Logger.verbose(`\tENDLOAD: Areas`);
	}

	/**
	 * @param {string} bundle
	 * @param {string} areaName
	 * @param {object} manifest
	 */
	async loadArea(bundle: string, areaName: string, manifest: IAreaManifest) {
		const definition: IAreaDef = {
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
			if (!fs.existsSync(areaScriptPath)) {
				Logger.warn(
					`\t\t\t[${areaName}] has non-existent script "${manifest.script}"`
				);
			}

			Logger.verbose(
				`\t\t\tLoading Area Script for [${areaName}]: ${manifest.script}`
			);
			this.loadEntityScript(this.state.AreaFactory, areaName, areaScriptPath);
		}

		Logger.verbose(`\t\tLOAD: Quests...`);
		definition.quests = await this.loadQuests(bundle, areaName);
		Logger.verbose(`\t\tLOAD: Items...`);
		definition.items = await this.loadEntities(
			bundle,
			areaName,
			EntityLoaderKeys.ITEMS,
			this.state.ItemFactory
		);
		Logger.verbose(`\t\tLOAD: NPCs...`);
		definition.npcs = await this.loadEntities(
			bundle,
			areaName,
			EntityLoaderKeys.NPCS,
			this.state.MobFactory
		);
		Logger.verbose(`\t\tLOAD: Rooms...`);
		definition.rooms = await this.loadEntities(
			bundle,
			areaName,
			EntityLoaderKeys.ROOMS,
			this.state.RoomFactory
		);
		Logger.verbose('\t\tDone.');

		for (const npcRef of definition.npcs) {
			const npc = this.state.MobFactory.getDefinition(npcRef);
			if (!npc?.quests) {
				continue;
			}

			// Update quest definitions with their questor
			// TODO: This currently means a given quest can only have a single questor, perhaps not optimal
			for (const qid of npc.quests) {
				const quest = this.state.QuestFactory.get(qid);
				if (!quest) {
					Logger.error(
						`\t\t\tError: NPC is questor for non-existent quest [${qid}]`
					);
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
	async loadEntities(
		bundle: string,
		areaName: string,
		type: EntityLoaderKeys,
		factory: EntityFactoryType
	): Promise<string[]> {
		const loader = this.loaderRegistry.get(type);
		loader.setBundle(bundle);
		loader.setArea(areaName);

		if (!(await loader.hasData())) {
			return [];
		}

		const entities = (await loader.fetchAll()) as GameEntityDefinition[];
		if (!entities) {
			Logger.warn(`\t\t\t${type} has an invalid value [${entities}]`);
			return [];
		}
		return entities.map((entity) => {
			const entityRef = factory.createEntityRef(areaName, entity.id);
			entity.area = areaName;
			factory.setDefinition(entityRef, entity);
			if (entity.script !== undefined) {
				let scriptPath = '';
				switch (type) {
					case EntityLoaderKeys.NPCS: {
						scriptPath = this._getAreaScriptPath(bundle, 'npc');
						break;
					}
					case EntityLoaderKeys.ITEMS: {
						scriptPath = this._getAreaScriptPath(bundle, 'item');
						break;
					}
					case EntityLoaderKeys.ROOMS: {
						scriptPath = this._getAreaScriptPath(bundle, 'room');
						break;
					}
				}

				const entityScript = `${scriptPath}/${entity.script}.js`;
				if (!fs.existsSync(entityScript)) {
					Logger.warn(
						`\t\t\t[${entityRef}] has non-existent script "${entity.script}"`
					);
				} else {
					Logger.verbose(
						`\t\t\tLoading Script [${entityRef}] ${entity.script}`
					);
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
	loadEntityScript(
		factory: EntityFactoryType,
		entityRef: EntityReference,
		scriptPath: string
	) {
		const loader = require(scriptPath);
		const scriptListeners = this._getLoader<IListenersLoader>(
			loader,
			srcPath
		).listeners;

		for (const [eventName, listener] of Object.entries(scriptListeners)) {
			Logger.verbose(`\t\t\t\tEvent: ${eventName}`);
			factory.addScriptListener(entityRef, eventName, listener(this.state));
		}
	}

	/**
	 * @param {string} bundle
	 * @param {string} areaName
	 * @return {Promise<Array<string>>}
	 */
	async loadQuests(bundle: string, areaName: string) {
		const loader = this.loaderRegistry.get(EntityLoaderKeys.QUESTS);
		loader.setBundle(bundle);
		loader.setArea(areaName);
		let quests = [];
		try {
			quests = await loader.fetchAll();
		} catch (err) {}

		return quests.map((quest: IQuestDef) => {
			Logger.verbose(`\t\t\tLoading Quest [${areaName}:${quest.id}]`);
			this.state.QuestFactory.add(areaName, quest.id, quest);
			return this.state.QuestFactory.makeQuestKey(areaName, quest.id);
		});
	}

	/**
	 * @param {string} bundle
	 * @param {string} commandsDir
	 */
	loadCommands(bundle: string, commandsDir: string) {
		Logger.verbose(`\tLOAD: Commands...`);
		const files = fs.readdirSync(commandsDir);

		for (const commandFile of files) {
			const commandPath = commandsDir + commandFile;
			if (!Data.isScriptFile(commandPath, commandFile)) {
				continue;
			}

			const commandName = path.basename(commandFile, path.extname(commandFile));
			const command = this.createCommand(commandPath, commandName, bundle);
			this.state.CommandManager.add(command);
		}

		Logger.verbose(`\tENDLOAD: Commands...`);
	}

	/**
	 * @param {string} commandPath
	 * @param {string} commandName
	 * @param {string} bundle
	 * @return {Command}
	 */
	createCommand(commandPath: string, commandName: string, bundle: string) {
		const loader = require(commandPath);
		const cmdImport: ICommandDef = this._getLoader(
			loader,
			srcPath,
			this.bundlesPath
		);
		cmdImport.command = cmdImport.command(this.state);

		return new Command(bundle, commandName, cmdImport, commandPath);
	}

	/**
	 * @param {string} bundle
	 * @param {string} channelsFile
	 */
	loadChannels(bundle: string, channelsFile: string) {
		Logger.verbose(`\tLOAD: Channels...`);

		const loader = require(channelsFile);
		let channels = this._getLoader<IChannelLoader>(loader, srcPath);

		if (!Array.isArray(channels)) {
			channels = [channels];
		}

		channels.forEach((channel: Channel) => {
			channel.bundle = bundle;
			this.state.ChannelManager.add(channel);
		});

		Logger.verbose(`\tENDLOAD: Channels...`);
	}

	/**
	 * @param {string} bundle
	 */
	async loadHelp(bundle: string) {
		Logger.verbose(`\tLOAD: Help...`);
		const loader = this.loaderRegistry.get(EntityLoaderKeys.HELP);
		loader.setBundle(bundle);

		if (!(await loader.hasData())) {
			return;
		}

		const records = await loader.fetchAll();
		for (const helpName in records) {
			try {
				const hfile = new Helpfile(bundle, helpName, records[helpName].doc);

				const command =
					hfile.command && this.state.CommandManager.get(hfile.command);
				hfile.aliases = command ? command.aliases || [] : [];

				this.state.HelpManager.add(hfile);
			} catch (e: any) {
				Logger.warn(`\t\t${e?.message}`);
				continue;
			}
		}

		Logger.verbose(`\tENDLOAD: Help...`);
	}

	/**
	 * @param {string} bundle
	 * @param {string} inputEventsDir
	 */
	loadInputEvents(bundle: string, inputEventsDir: string) {
		Logger.verbose(`\tLOAD: Events...`);
		const files = fs.readdirSync(inputEventsDir);

		for (const eventFile of files) {
			const eventPath = inputEventsDir + eventFile;
			if (!Data.isScriptFile(eventPath, eventFile)) {
				continue;
			}

			const eventName = path.basename(eventFile, path.extname(eventFile));
			const loader = require(eventPath);
			const eventImport = this._getLoader<IEventLoader>(loader, srcPath);

			if (typeof eventImport.event !== 'function') {
				throw new Error(
					`Bundle ${bundle} has an invalid input event '${eventName}'. Expected a function, got: ` +
						eventImport.event
				);
			}

			this.state.InputEventManager.add(
				eventName,
				eventImport.event(this.state)
			);
		}

		Logger.verbose(`\tENDLOAD: Events...`);
	}

	/**
	 * @param {string} bundle
	 * @param {string} behaviorsDir
	 */
	loadBehaviors(bundle: string, behaviorsDir: string) {
		Logger.verbose(`\tLOAD: Behaviors...`);
		const loadEntityBehaviors = (
			type: string,
			manager: BehaviorManager,
			state: IGameState
		) => {
			let typeDir = behaviorsDir + type + '/';

			if (!fs.existsSync(typeDir)) {
				return;
			}

			Logger.verbose(`\t\tLOAD: BEHAVIORS [${type}]...`);
			const files = fs.readdirSync(typeDir);

			for (const behaviorFile of files) {
				const behaviorPath = typeDir + behaviorFile;
				if (!Data.isScriptFile(behaviorPath, behaviorFile)) {
					continue;
				}

				const behaviorName = path.basename(
					behaviorFile,
					path.extname(behaviorFile)
				);
				Logger.verbose(`\t\t\tLOAD: BEHAVIORS [${type}] ${behaviorName}...`);
				const loader = require(behaviorPath);
				const behaviorListeners = this._getLoader<IListenersLoader>(
					loader,
					srcPath
				).listeners;

				for (const [eventName, listener] of Object.entries(behaviorListeners)) {
					manager.addListener(behaviorName, eventName, listener(state));
				}
			}
		};

		loadEntityBehaviors('area', this.state.AreaBehaviorManager, this.state);
		loadEntityBehaviors('npc', this.state.MobBehaviorManager, this.state);
		loadEntityBehaviors('item', this.state.ItemBehaviorManager, this.state);
		loadEntityBehaviors('room', this.state.RoomBehaviorManager, this.state);

		Logger.verbose(`\tENDLOAD: Behaviors...`);
	}

	/**
	 * @param {string} bundle
	 * @param {string} effectsDir
	 */
	loadEffects(bundle: string, effectsDir: string) {
		Logger.verbose(`\tLOAD: Effects...`);
		const files = fs.readdirSync(effectsDir);

		for (const effectFile of files) {
			const effectPath = effectsDir + effectFile;
			if (!Data.isScriptFile(effectPath, effectFile)) {
				continue;
			}

			const effectName = path.basename(effectFile, path.extname(effectFile));
			const loader = require(effectPath);
			const efectImport: IEffectDef = this._getLoader(loader, srcPath);

			Logger.verbose(`\t\t${effectName}`);
			this.state.EffectFactory.add(effectName, efectImport, this.state);
		}

		Logger.verbose(`\tENDLOAD: Effects...`);
	}

	/**
	 * @param {string} bundle
	 * @param {string} skillsDir
	 */
	loadSkills(bundle: string, skillsDir: string) {
		Logger.verbose(`\tLOAD: Skills...`);
		const files = fs.readdirSync(skillsDir);

		for (const skillFile of files) {
			const skillPath = skillsDir + skillFile;
			if (!Data.isScriptFile(skillPath, skillFile)) {
				continue;
			}

			const skillName = path.basename(skillFile, path.extname(skillFile));
			const loader = require(skillPath);
			const skillImport = this._getLoader<ISkillOptions>(loader, srcPath);
			if (skillImport.run) {
				skillImport.run = skillImport.run(this.state);
			}

			Logger.verbose(`\t\t${skillName}`);
			const skill = new Skill(skillName, skillImport, this.state);

			if (skill.type === SkillType.SKILL) {
				this.state.SkillManager.add(skill);
			} else {
				this.state.SpellManager.add(skill);
			}
		}

		Logger.verbose(`\tENDLOAD: Skills...`);
	}

	/**
	 * @param {string} bundle
	 * @param {string} serverEventsDir
	 */
	loadServerEvents(bundle: string, serverEventsDir: string) {
		Logger.verbose(`\tLOAD: Server Events...`);
		const files = fs.readdirSync(serverEventsDir);

		for (const eventsFile of files) {
			const eventsPath = serverEventsDir + eventsFile;
			if (!Data.isScriptFile(eventsPath, eventsFile)) {
				continue;
			}

			const eventsName = path.basename(eventsFile, path.extname(eventsFile));
			Logger.verbose(`\t\t\tLOAD: SERVER-EVENTS ${eventsName}...`);
			const loader = require(eventsPath);
			const eventsListeners = this._getLoader<IListenersLoader>(
				loader,
				srcPath
			).listeners;
			if (!eventsListeners) {
				continue;
			}

			for (const [eventName, listener] of Object.entries(eventsListeners)) {
				this.state.ServerEventManager.add(eventName, listener(this.state));
			}
		}

		Logger.verbose(`\tENDLOAD: Server Events...`);
	}

	/**
	 * For a given bundle js file require check if it needs to be backwards compatibly loaded with a loader(srcPath)
	 * or can just be loaded on its own
	 * @private
	 * @param {function (string)|object|array} loader
	 * @return {loader}
	 */
	_getLoader<T>(loader: Function, ...args: any[]): T {
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
	_getAreaScriptPath(bundle: string, type: string) {
		return `${this.bundlesPath}/${bundle}/scripts/${type}`;
	}
}
