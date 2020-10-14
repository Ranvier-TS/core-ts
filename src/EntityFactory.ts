import { Area } from "./Area";
import { Attributes } from "./Attributes";
import { BehaviorManager } from "./BehaviorManager";
import { EntityReference } from "./EntityReference";
import { GameEntities } from "./GameEntity";
import { Item } from "./Item";
import { ItemFactory } from "./ItemFactory";
import { ItemType } from "./ItemType";
import { MobFactory } from "./MobFactory";
import { Npc } from "./Npc";
import { Room } from "./Room";
import { RoomFactory } from "./RoomFactory";

export type EntityFactoryType = ItemFactory | MobFactory | RoomFactory;
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
    return area + ":" + id;
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
      throw new Error("No Entity definition found for " + entityRef);
    }
    const entity = new Type(area, definition);

    if (this.scripts?.has(entityRef)) {
      this.scripts.get(entityRef)?.attach(entity);
    }

    return entity;
  }

  create(...args: any[]) {
    throw new Error("No type specified for Entity.create");
  }

  /**
   * Clone an existing entity
   *
   * @param {Item|Npc|Room|Area} entity
   * @return {Item|Npc|Room|Area}
   */
  clone(entity: Room | Npc | Item | Area) {
    return this.create(entity.area, entity.entityReference);
  }

  /**
   * Modify an entity's definition
   */
  modifyDefinition(entity: GameEntities, toSet: any, newProps: any) {
    // if this is the initial function call, iterate over all properties
    if (toSet === false) {
      // console.log(`\nfirst time firing for ${entity.name}...\n========`)
      for (const prop of Object.keys(newProps)) {
        this.modifyDefinition(entity, prop, newProps[prop]);
      }
    }

    // otherwise, handle the specified property
    else {
      // console.log(`==handling nested prop {${toSet}} for ${entity.name}...`)
      // if the new property is simple flat data
      if (typeof newProps !== "object") {
        switch (typeof toSet) {
          case "boolean":
          case "number":
          case "string": {
            // handle setting type
            if (toSet === "type") {
              // console.log('__!', toSet, 'flat data (type) is now:', newProps)
              return (entity.type = ItemType[newProps] || newProps);
            }
            entity[toSet] = newProps;
            // console.log('__!', toSet, 'flat data is now:', newProps)
            return;
          }
        }
      }

      if (toSet === "attributes") {
        if (entity[toSet] instanceof Attributes) {
          for (const attr in newProps) {
            entity[toSet].get(attr).setBase(newProps[attr]);
          }
        } else {
          for (const attr in newProps) {
            entity[toSet][attr] = newProps[attr];
          }
        }
      }

      // handles protoypes? and more?
      if (toSet === "behaviors") {
        if (newProps instanceof Map) {
          newProps.forEach((val, key) => {
            if (val["..."] === true) {
              delete val["..."];
              entity[toSet].set(key, { ...entity[toSet].get(key), ...val });
            } else {
              entity[toSet].set(key, val);
            }
          });
        }
      }

      for (const prop of Object.keys(newProps)) {
        // if handling a first-level prop
        if (Object.keys(newProps)[0] === "...") {
          if (newProps["..."] === true) {
            if (newProps.value !== undefined) {
              if (Array.isArray(newProps.value)) {
                delete newProps["..."];
                entity[toSet] = [...entity[toSet], ...newProps.value];
                // console.log(`'...' is true so added [${newProps.value}] to def array for {${toSet}}, now: ${entity[toSet]}`)
              }
            } else {
              delete newProps["..."];
              this.modifyDefinition(entity[toSet], prop, newProps);
              // console.log('deep array copied ->', prop)
            }
          } else {
            if (newProps["..."] !== undefined) {
              delete newProps["..."];
              entity[toSet] = newProps.value;
              // console.log(`'...' is false so added def array for {${toSet}}, now: ${entity[toSet]}`)
            } else {
              entity[toSet] = newProps.value;
            }
          }
          return;
        } else {
          if (toSet === "items") {
            // console.log('setting items...')
            for (const p of Object.keys(newProps)) {
              entity.defaultItems[p] = newProps[p];
            }
            return;
          }
        }

        if (prop === "grammar") {
          // console.log('handling grammar... ', newProps[prop])
          if (!entity[toSet][prop]) {
            entity[toSet][prop] = {};
          }
          for (const prop1 of Object.keys(newProps[prop])) {
            if (newProps[prop][prop1]["..."] === true) {
              // don't try to inherit a metadatabase grammar
              if (prop1.substr(0, 1) === "$") continue;
              newProps[prop][prop1] = [
                ...entity[toSet][prop][prop1],
                ...newProps[prop][prop1].value,
              ];
              delete newProps[prop][prop1]["..."];
              Object.assign(entity[toSet][prop][prop1], newProps[prop][prop1]);
            }
          }
          Object.assign(entity[toSet][prop], newProps[prop]);
          // console.log('final grammar:', entity[toSet][prop])
          continue;
        }

        if (toSet === "behaviors") {
          if (Object.keys(newProps[prop])[0] === "...") {
            if (newProps[prop]["..."] === false) {
              delete newProps[prop]["..."];
              entity[toSet].set(prop, newProps[prop]);
              continue;
            }
            delete newProps[prop]["..."];
            entity[toSet].set(
              prop,
              Object.assign(
                {},
                { ...entity[toSet].get(prop), ...newProps[prop] }
              )
            );
            continue;
          }
          entity[toSet].set(prop, newProps[prop]);
          continue;
        }

        switch (typeof newProps[prop]) {
          case "boolean":
          case "number":
          case "string": {
            entity[toSet][prop] = newProps[prop];
            // console.log('copied flat var ->', prop)
            break;
          }
          case "object": {
            // console.log('obj to copy ->', prop)
            if (Array.isArray(newProps[prop])) {
              entity[toSet][prop] = newProps[prop];
              // console.log('flat array copied ->', prop)
            } else {
              if (Object.keys(newProps[prop])[0] === "...") {
                if (newProps[prop]["..."] === true) {
                  if (newProps[prop].value !== undefined) {
                    if (Array.isArray(newProps[prop].value)) {
                      entity[toSet][prop] = [
                        ...entity[toSet][prop],
                        ...newProps[prop].value,
                      ];
                      // console.log(`'...' is true so added [${newProps[prop].value}] to def array for {${prop}}, now: ${entity[toSet][prop]}`)
                    }
                  } else {
                    delete newProps[prop]["..."];
                    this.modifyDefinition(entity[toSet], prop, newProps[prop]);
                    // console.log('deep array copied ->', prop)
                  }
                } else {
                  delete newProps[prop]["..."];
                  if (newProps[prop].value !== undefined) {
                    this.modifyDefinition(
                      entity[toSet],
                      prop,
                      newProps[prop].value
                    );
                  } else {
                    this.modifyDefinition(entity[toSet], prop, newProps[prop]);
                  }
                  // console.log('deep array copied ~~>', prop)
                }
              } else {
                if (!Array.isArray(newProps[prop])) {
                  // console.log(Object.keys(newProps[prop])[0])
                  if (Object.keys(newProps[prop])[0] !== "...") {
                    if (Array.isArray(newProps[prop].value)) {
                      entity[toSet][prop] = newProps[prop].value;
                      // console.log('added to def~~ array ->', prop, entity[toSet][prop])
                    } else {
                      this.modifyDefinition(
                        entity[toSet],
                        prop,
                        newProps[prop]
                      );
                    }
                    continue;
                  }
                }
                // console.log('starting loop through', Object.keys(newProps[prop]), 'for', prop)
                for (const innerProp of Object.keys(newProps[prop])) {
                  if (Object.keys(newProps[prop][innerProp])[0] === "...") {
                    if (newProps[prop][innerProp]["..."] === true) {
                      if (newProps[prop][innerProp].value !== undefined) {
                        if (Array.isArray(newProps[prop][innerProp].value)) {
                          entity[toSet][prop][innerProp] = [
                            ...entity[toSet][prop][innerProp],
                            ...newProps[prop][innerProp].value,
                          ];
                          // console.log('added to def array ->', prop)
                        }
                      }
                    }
                  } else {
                    delete newProps[prop]["..."];
                    this.modifyDefinition(
                      entity[toSet],
                      innerProp,
                      newProps[prop][innerProp]
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
