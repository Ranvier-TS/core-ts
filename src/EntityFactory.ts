import { EventEmitter } from 'events';
import { Area } from './Area';
import { AreaFactory } from './AreaFactory';
import { Attributes } from './Attributes';
import { BehaviorManager } from './BehaviorManager';
import { EntityReference } from './EntityReference';
import { GameEntities } from './GameEntity';
import { Item } from './Item';
import { ItemFactory } from './ItemFactory';
import { ItemType } from './ItemType';
import { MobFactory } from './MobFactory';
import { Npc } from './Npc';
import { Room } from './Room';
import { RoomFactory } from './RoomFactory';

export type EntityFactoryType =
	| ItemFactory
	| MobFactory
	| RoomFactory
	| AreaFactory;
/**
 * Stores definitions of entities to allow for easy creation/cloning
 */
export class EntityFactory {
	entities: Map<EntityReference, any>;
	scripts: BehaviorManager;
	constructor() {
		this.entities = new Map();
		this.scripts = new BehaviorManager();
	}

	/**
	 * Create the key used by the entities and scripts maps
	 * @param {string} areaName
	 * @param {number} id
	 * @return {string}
	 */
	createEntityRef(area: string, id: string | number) {
		return area + ':' + id;
	}

	/**
	 * @param {string} entityRef
	 * @return {Object}
	 */
	getDefinition(entityRef: EntityReference) {
		return this.entities.get(entityRef);
	}

	/**
	 * @param {string} entityRef
	 * @param {Object} def
	 */
	setDefinition(entityRef: EntityReference, def: any) {
		def.entityReference = entityRef;
		this.entities.set(entityRef, def);
	}

	/**
	 * Add an event listener from a script to a specific item
	 * @see BehaviorManager::addListener
	 * @param {string}   entityRef
	 * @param {string}   event
	 * @param {Function} listener
	 */
	addScriptListener(
		entityRef: EntityReference,
		event: string,
		listener: Function
	) {
		this.scripts.addListener(entityRef, event, listener);
	}

	/**
	 * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
	 * and will _not_ have its default contents. If you want it to also populate its default contents
	 * you must manually call `npc.hydrate(state)`
	 *
	 * @param {Area}   area
	 * @param {string} entityRef
	 * @param {Class}  Type      Type of entity to instantiate
	 * @return {type}
	 */
	createByType(
		area: Area,
		entityRef: EntityReference,
		Type: typeof Room | typeof Npc | typeof Item
	) {
		const definition = this.getDefinition(entityRef);
		if (!definition) {
			throw new Error(`[${Type.name}Factory] No Entity definition found for ${entityRef}`);
		}
		const entity = new Type(area, definition);

		if (this.scripts?.has(entityRef)) {
			this.scripts.get(entityRef)?.attach(entity as any);
		}

		return entity;
	}

	create(...args: any[]) {
		throw new Error('No type specified for Entity.create');
	}

	/**
	 * Clone an existing entity
	 *
	 * @param {Item|Npc|Room|Area} entity
	 * @return {Item|Npc|Room|Area}
	 */
	clone(entity: Room | Npc | Item | Area) {
		if (
			entity instanceof Room ||
			entity instanceof Npc ||
      entity instanceof Item
      // Area type handled in AreaFactory.clone()
		) {
			return this.create(entity.area, entity.entityReference);
		}
	}
}
