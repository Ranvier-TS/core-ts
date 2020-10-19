"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEntity = void 0;
const EffectableEntity_1 = require("./EffectableEntity");
const Metadatable_1 = require("./Metadatable");
const Scriptable_1 = require("./Scriptable");
/**
 * @extends EventEmitter
 * @mixes Metadatable
 * @mixes Scriptable
 */
class GameEntity extends Scriptable_1.Scriptable(Metadatable_1.Metadatable(EffectableEntity_1.EffectableEntity)) {
}
exports.GameEntity = GameEntity;
