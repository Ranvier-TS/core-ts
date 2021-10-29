import { Area } from './Area';
import { Character } from './Character';
import { EffectableEntity } from './EffectableEntity';
import { IItemDef, Item } from './Item';
import { Metadatable } from './Metadatable';
import { INpcDef, Npc } from './Npc';
import { Player } from './Player';
import { IRoomDef, Room } from './Room';
import { Scriptable } from './Scriptable';

/**
 * @extends EventEmitter
 * @mixes Metadatable
 * @mixes Scriptable
 */
export class GameEntity extends Scriptable(Metadatable(EffectableEntity)) {}

export type PlayerOrNpc = Player | Npc;
export type AnyCharacter = PlayerOrNpc | Character;
export type GameEntities = Item | Npc | Room;
export type AnyGameEntity = Item | Npc | Room | Area | Player;
export type GameEntityDefinition = IItemDef | INpcDef | IRoomDef;

export interface PruneableEntity {
	__pruned?: boolean;
}