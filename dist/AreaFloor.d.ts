import { Room } from './Room';
/**
 * IF you absolutely need to iterate over a floor in a tight (nested) loop you
 * should use the low/high properties like so.
 *
 * ```javascript
 * const floor = area.map.get(2);
 * for (let x = floor.lowX; x <= floor.highX; x++) {
 *  for (let y = floor.lowY; y <= floor.highY; y++) {
 *    const room = floor.getRoom(x, y);
 *
 *    if (!room) {
 *      continue;
 *    }
 *  }
 * }
 * ```
 *
 * Note the `<=` to avoid fenceposting the loop
 *
 * @property {number} lowX The lowest x value
 * @property {number} highX The highest x value
 * @property {number} lowY The lowest y value
 * @property {number} highY The highest y value
 * @property {number} z This floor's z index
 */
export declare class AreaFloor {
    /** @property {number} lowX The lowest x value */
    lowX: number;
    /** @property {number} highX The highest x value */
    highX: number;
    /** @property {number} lowY The lowest y value */
    lowY: number;
    /** @property {number} highY The highest y value */
    highY: number;
    /** @property {number} z This floor's z index */
    z: number;
    map: Room[][] | undefined[][];
    constructor(z: number);
    addRoom(x: number, y: number, room: Room): void;
    /**
     * @return {Room|boolean}
     */
    getRoom(x: number, y: number): Room | undefined;
    removeRoom(x: number, y: number): void;
}
