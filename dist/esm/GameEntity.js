import { EffectableEntity } from './EffectableEntity';
import { Metadatable } from './Metadatable';
import { Scriptable } from './Scriptable';
/**
 * @extends EventEmitter
 * @mixes Metadatable
 * @mixes Scriptable
 */
export class GameEntity extends Scriptable(Metadatable(EffectableEntity)) {
}
