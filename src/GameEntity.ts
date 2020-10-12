import { EventEmitter } from "events";
import { Metadatable } from "./Metadatable";
import { Npc } from "./Npc";
import { Player } from "./Player";
import { Scriptable } from "./Scriptable";

/**
 * @extends EventEmitter
 * @mixes Metadatable
 * @mixes Scriptable
 */
export class GameEntity extends Scriptable(Metadatable(EventEmitter)) {}

export type PlayerOrNpc = Player | Npc;

