import { Area } from './Area';
import { EntityFactory } from './EntityFactory';
import { EntityReference } from './EntityReference';
import { INpcDef, Npc } from './Npc';

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 * @extends EntityFactory
 */
export class MobFactory extends EntityFactory<INpcDef> {
	/**
	 * Create a new instance of a given npc definition. Resulting npc will not
	 * have its default inventory.  If you want to also populate its default
	 * contents you must manually call `npc.hydrate(state)`
	 *
	 * @param {Area}   area
	 * @param {string} entityRef
	 * @return {Npc}
	 */
	create(area: Area, entityRef: EntityReference): Npc {
		const npc = this.createByType(area, entityRef, Npc);
		npc.area = area;
		return npc as Npc;
	}
}
