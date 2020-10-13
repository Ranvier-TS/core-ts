import { EffectableEntity } from "./EffectableEntity";
import { Metadatable } from "./Metadatable";
import { Npc } from "./Npc";
import { Player } from "./Player";
import { Scriptable } from "./Scriptable";

/**
 * @extends EventEmitter
 * @mixes Metadatable
 * @mixes Scriptable
 */
export class GameEntity extends Scriptable(Metadatable(EffectableEntity)) {}

export type PlayerOrNpc = Player | Npc;

