import { Area } from "./Area";
import { EntityFactory } from "./EntityFactory";
import { EntityReference } from "./EntityReference";
import { Room } from "./Room";

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 * @extends EntityFactory
 */
export class RoomFactory extends EntityFactory {
  /**
   * Create a new instance of a given room. Room will not be hydrated
   *
   * @param {Area}   area
   * @param {string} entityRef
   * @return {Room}
   */
  create(area: Area, entityRef: EntityReference) {
    const npc = this.createByType(area, entityRef, Room);
    npc.area = area;
    return npc;
  }
}