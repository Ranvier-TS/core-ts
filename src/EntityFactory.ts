import { EffectableEntity } from '.';
import { Area } from './Area';
import { BehaviorManager } from './BehaviorManager';
import { EntityReference } from './EntityReference';
import { Item } from './Item';
import { Npc } from './Npc';
import { Room } from './Room';

export type EntityDefinitionBase = {
	entityReference: string;
	id: string;
	script?: string;
	area?: string;
};

type EntityConstructor<TEntity, TDef extends EntityDefinitionBase> = new (
	area: Area,
	def: TDef,
	...args: any[]
) => TEntity;

/**
 * Stores definitions of entities to allow for easy creation/cloning
 */
export abstract class EntityFactory<
	TEntity extends EffectableEntity,
	TDef extends EntityDefinitionBase
> {
	entities: Map<EntityReference, TDef>;
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
	createEntityRef(area: string, id: string | number): string {
		return area + ':' + id;
	}

	/**
	 * @param {string} entityRef
	 * @return {Object}
	 */
	getDefinition(entityRef: EntityReference): TDef | undefined {
		return this.entities.get(entityRef);
	}

	/**
	 * @param {string} entityRef
	 * @param {Object} def
	 */
	setDefinition(entityRef: EntityReference, def: TDef): void {
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
	): void {
		this.scripts.addListener(entityRef, event, listener);
	}

	/**
	 * Create a new instance of a given npc definition. Resulting npc will not be held or equipped
	 * and will _not_ have its default contents. If you want it to also populate its default contents
	 * you must manually call `npc.hydrate(state)`
	 *
	 * @param {Area}   area
	 * @param {string} entityRef
	 * @param {Class}  Constructor      Type of entity to instantiate
	 * @return {type}
	 */
	createByType(
		area: Area,
		entityRef: EntityReference,
		Constructor: EntityConstructor<TEntity, TDef>
	): TEntity {
		const definition = this.getDefinition(entityRef);
		if (!definition) {
			throw new Error(
				`[${Constructor.name}Factory] No Entity definition found for ${entityRef}`
			);
		}

		const entity = new Constructor(area, definition);

		if (this.scripts?.has(entityRef)) {
			this.scripts.get(entityRef)?.attach(entity as any);
		}

		return entity;
	}

	create(...args: any[]): TEntity {
		throw new Error('No type specified for Entity.create');
	}

	/**
	 * Clone an existing entity
	 *
	 * @param {Item|Npc|Room|Area} entity
	 * @return {Item|Npc|Room|Area}
	 */
	clone(entity: TEntity): TEntity | undefined {
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
