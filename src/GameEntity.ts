import { Area } from './Area';
import { EffectableEntity } from './EffectableEntity';
import { Item } from './Item';
import { Metadatable } from './Metadatable';
import { Npc } from './Npc';
import { Player } from './Player';
import { Room } from './Room';
import { Scriptable } from './Scriptable';

/**
 * @extends EventEmitter
 * @mixes Metadatable
 * @mixes Scriptable
 */
export class GameEntity extends Scriptable(Metadatable(EffectableEntity)) {}

export type PlayerOrNpc = Player | Npc;
export type GameEntities = Item | Npc | Room;
export type AnyGameEntity = Item | Npc | Room | Area | Player;
