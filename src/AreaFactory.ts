import { Area, IAreaDef } from './Area';
import { EntityFactory } from './EntityFactory';
import { EntityReference } from './EntityReference';

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
export class AreaFactory extends EntityFactory<IAreaDef> {
	/**
	 * Create a new instance of an area by name. Resulting area will not have
	 * any of its contained entities (items, npcs, rooms) hydrated. You will
	 * need to call `area.hydrate(state)`
	 *
	 * @param {GameState} state
	 * @param {string} bundle Name of this bundle this area is defined in
	 * @param {string} entityRef Area name
	 * @return {Area}
	 */
	create(entityRef: EntityReference): Area {
		const definition = this.getDefinition(entityRef);
		if (!definition) {
			throw new Error(
				'[AreaFactory] No Entity definition found for ' + entityRef
			);
		}

		const area = new Area(definition.bundle, entityRef, definition.manifest);

		if (this.scripts.has(entityRef)) {
			this.scripts?.get(entityRef)?.attach(area as any);
		}

		return area;
	}

	/**
	 * @see AreaFactory#create
	 */
	clone(area: Area): Area {
		return this.create(area.name);
	}
}
