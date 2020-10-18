import { PlayerOrNpc } from './GameEntity';
/** @typedef {{getBroadcastTargets: function(): Array}} */
export declare type Broadcastable = PlayerOrNpc | {
    getBroadcastTargets: () => Broadcastable[];
};
export declare type FormatterFn = (target: Broadcastable, message: string) => string;
/**
 * Class used for sending text to the player. All output to the player should happen through this
 * class.
 */
export declare class Broadcast {
    /**
     * @param {Broadcastable} source Target to send the broadcast to
     * @param {string} message
     * @param {number|boolean} wrapWidth=false width to wrap the message to or don't wrap at all
     * @param {boolean} useColor Whether to parse color tags in the message
     * @param {?function(target, message): string} formatter=null Function to call to format the
     *   message to each target
     */
    static at(source: Broadcastable, message?: string, wrapWidth?: false | number, useColor?: boolean, formatter?: FormatterFn | null): void;
    /**
     * Broadcast.at for all except given list of players
     * @see {@link Broadcast#at}
     * @param {Broadcastable} source
     * @param {string} message
     * @param {Array<Player>|Player} excludes
     * @param {number|boolean} wrapWidth
     * @param {boolean} useColor
     * @param {function} formatter
     */
    static atExcept(source: Broadcastable, message: string, excludes: Broadcastable[] | Broadcastable, wrapWidth?: number, useColor?: boolean, formatter?: FormatterFn): void;
    /**
     * `Broadcast.at` with a newline
     * @see {@link Broadcast#at}
     */
    static sayAt(source: Broadcastable, message?: string, wrapWidth?: number, useColor?: boolean, formatter?: FormatterFn): void;
    /**
     * `Broadcast.atExcept` with a newline
     * @see {@link Broadcast#atExcept}
     */
    static sayAtExcept(source: Broadcastable, message: string, excludes: Broadcastable[], wrapWidth?: number, useColor?: boolean, formatter?: FormatterFn): void;
    /**
     * `Broadcast.atFormatted` with a newline
     * @see {@link Broadcast#atFormatted}
     */
    static sayAtFormatted(source: Broadcastable, message: string, formatter?: FormatterFn, wrapWidth?: number, useColor?: boolean): void;
    /**
     * Render the player's prompt including any extra prompts
     * @param {Player} player
     * @param {?object} extra     extra data to avail to the prompt string interpolator
     * @param {?number} wrapWidth
     * @param {?boolean} useColor
     */
    static prompt(player: Broadcastable, extra?: Record<string, unknown>, wrapWidth?: number, useColor?: boolean): void;
    /**
     * Generate an ASCII art progress bar
     * @param {number} width Max width
     * @param {number} percent Current percent
     * @param {string} color
     * @param {string} barChar Character to use for the current progress
     * @param {string} fillChar Character to use for the rest
     * @param {string} delimiters Characters to wrap the bar in
     * @return {string}
     */
    static progress(width: number, percent: number, color: string, barChar?: string, fillChar?: string, delimiters?: string): string;
    /**
     * Capitalize a message
     * @param {string}  message
     * @return {string}
     */
    static capitalize(message: string): string;
    /**
     * Return a simple channel reporter implementing Broadcastable
     * @param {string}  name
     * @return {string}
     */
    static getSystemReporter(name?: string): {
        name: string;
        getBroadcastTargets(): never[];
    };
    /**
     * Center a string in the middle of a given width
     * @param {number} width
     * @param {string} message
     * @param {string} color
     * @param {?string} fillChar Character to pad with, defaults to ' '
     * @return {string}
     */
    static center(width: number, message: string, color?: string, fillChar?: string): string;
    /**
     * Render a line of a specific width/color
     * @param {number} width
     * @param {string} fillChar
     * @param {?string} color
     * @return {string}
     */
    static line(width: number, fillChar?: string, color?: string): string;
    /**
     * Wrap a message to a given width. Note: Evaluates color tags
     * @param {string}  message
     * @param {?number} width   Defaults to 80
     * @param {?number} indent left padding for wrapping lines
     * @return {string}
     */
    static wrap(message: string, width?: number): string;
    /**
     * Indent all lines of a given string by a given amount
     * @param {string} message
     * @param {number} indent
     * @return {string}
     */
    static indent(message: string, indent: number): string;
    /**
     * Fix LF unpaired with CR for windows output
     * @param {string} message
     * @param {?string} indent
     * @return {string}
     * @private
     */
    static _fixNewlines(message: string): string;
    static isBroadcastable(source: Broadcastable): boolean;
}
