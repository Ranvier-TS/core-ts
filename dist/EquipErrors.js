"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipAlreadyEquippedError = exports.EquipSlotTakenError = void 0;
/**
 * @extends Error
 */
class EquipSlotTakenError extends Error {
}
exports.EquipSlotTakenError = EquipSlotTakenError;
class EquipAlreadyEquippedError extends Error {
}
exports.EquipAlreadyEquippedError = EquipAlreadyEquippedError;
