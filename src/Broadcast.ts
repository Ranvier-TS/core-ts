import { PlayerOrNpc } from './GameEntity';
import { Player } from './Player';

const ansi = require('sty');
ansi.enable(); // force ansi on even when there isn't a tty for the server
const wrap = require('wrap-ansi');

/** @typedef {{getBroadcastTargets: function(): Array}} */
export type Broadcastable =
	| PlayerOrNpc
	| {
			getBroadcastTargets: () => Broadcastable[];
	  };

export type FormatterFn = (target: Broadcastable, message: string) => string;

/**
 * Class used for sending text to the player. All output to the player should happen through this
 * class.
 */
export class Broadcast {
	/**
	 * @param {Broadcastable} source Target to send the broadcast to
	 * @param {string} message
	 * @param {number|boolean} wrapWidth=false width to wrap the message to or don't wrap at all
	 * @param {boolean} useColor Whether to parse color tags in the message
	 * @param {?function(target, message): string} formatter=null Function to call to format the
	 *   message to each target
	 */
	static at(
		source: Broadcastable,
		message: string = '',
		wrapWidth: false | number = false,
		useColor: boolean = true,
		formatter: FormatterFn | null = null
	) {
		if (!Broadcast.isBroadcastable(source)) {
			throw new Error(
				`Tried to broadcast message to non-broadcastable object: MESSAGE [${message}]`
			);
		}

		useColor = typeof useColor === 'boolean' ? useColor : true;
		formatter = formatter || ((target, message) => message);

		message = Broadcast._fixNewlines(message);

		for (const target of source.getBroadcastTargets()) {
			if (
				!(target instanceof Player) ||
				!target.socket ||
				!target.socket.writable
			) {
				continue;
			}

			if (target.socket._prompted) {
				target.socket.write('\r\n');
				target.socket._prompted = false;
			}

			let targetMessage = formatter(target, message);
			targetMessage = wrapWidth
				? Broadcast.wrap(targetMessage, wrapWidth)
				: ansi.parse(targetMessage);
			target.socket.write(targetMessage);
		}
	}

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
	static atExcept(
		source: Broadcastable,
		message: string,
		excludes: Broadcastable[] | Broadcastable,
		wrapWidth?: number,
		useColor?: boolean,
		formatter?: FormatterFn
	) {
		if (!Broadcast.isBroadcastable(source)) {
			throw new Error(
				`Tried to broadcast message to non-broadcastable object: MESSAGE [${message}]`
			);
		}

		// Could be an array or a single target.
		if (!Array.isArray(excludes)) {
			excludes = [excludes];
		}

		const targets = source
			.getBroadcastTargets()
			.filter(
				(target: Broadcastable) =>
					!(excludes as Broadcastable[]).includes(target)
			);

		const newSource = {
			getBroadcastTargets: () => targets,
		};

		Broadcast.at(newSource, message, wrapWidth, useColor, formatter);
	}

	/**
	 * `Broadcast.at` with a newline
	 * @see {@link Broadcast#at}
	 */
	static sayAt(
		source: Broadcastable,
		message?: string,
		wrapWidth?: number,
		useColor?: boolean,
		formatter?: FormatterFn
	) {
		Broadcast.at(
			source,
			message,
			wrapWidth,
			useColor,
			(target: Broadcastable, message: string) => {
				return (formatter ? formatter(target, message) : message) + '\r\n';
			}
		);
	}

	/**
	 * `Broadcast.atExcept` with a newline
	 * @see {@link Broadcast#atExcept}
	 */
	static sayAtExcept(
		source: Broadcastable,
		message: string,
		excludes: Broadcastable[],
		wrapWidth?: number,
		useColor?: boolean,
		formatter?: FormatterFn
	) {
		Broadcast.atExcept(
			source,
			message,
			excludes || [],
			wrapWidth,
			useColor,
			(target: Broadcastable, message: string) => {
				return (formatter ? formatter(target, message) : message) + '\r\n';
			}
		);
	}

	/**
	 * `Broadcast.atFormatted` with a newline
	 * @see {@link Broadcast#atFormatted}
	 */
	static sayAtFormatted(
		source: Broadcastable,
		message: string,
		formatter?: FormatterFn,
		wrapWidth?: number,
		useColor?: boolean
	) {
		Broadcast.sayAt(source, message, wrapWidth, useColor, formatter);
	}

	/**
	 * Render the player's prompt including any extra prompts
	 * @param {Player} player
	 * @param {?object} extra     extra data to avail to the prompt string interpolator
	 * @param {?number} wrapWidth
	 * @param {?boolean} useColor
	 */
	static prompt(
		player: Broadcastable,
		extra?: Record<string, unknown>,
		wrapWidth?: number,
		useColor?: boolean
	) {
		if (!(player instanceof Player) || !player.socket) {
			return;
		}

		player.socket._prompted = false;
		Broadcast.at(
			player as Broadcastable,
			'\r\n' + player.interpolatePrompt(player.prompt, extra) + ' ',
			wrapWidth,
			useColor
		);
		let needsNewline = player.extraPrompts.size > 0;
		if (needsNewline) {
			Broadcast.sayAt(player as Broadcastable);
		}

		for (const [id, extraPrompt] of player.extraPrompts) {
			Broadcast.sayAt(
				player as Broadcastable,
				extraPrompt.renderer(),
				wrapWidth,
				useColor
			);
			if (extraPrompt.removeOnRender) {
				player.removePrompt(id);
			}
		}

		if (needsNewline) {
			Broadcast.at(player as Broadcastable, '> ');
		}

		player.socket._prompted = true;
		if (player.socket.writable) {
			player.socket.command('goAhead');
		}
	}

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
	static progress(
		width: number,
		percent: number,
		color: string,
		barChar: string = '#',
		fillChar: string = ' ',
		delimiters: string = '()'
	) {
		percent = Math.max(0, percent);
		width -= 3; // account for delimiters and tip of bar
		if (percent === 100) {
			width++; // 100% bar doesn't have a second right delimiter
		}
		barChar = barChar[0];
		fillChar = fillChar[0];
		const [leftDelim, rightDelim] = delimiters;
		const openColor = `<${color}>`;
		const closeColor = `</${color}>`;
		let buf = openColor + leftDelim + '<bold>';
		const widthPercent = Math.round((percent / 100) * width);
		buf +=
			Broadcast.line(widthPercent, barChar) +
			(percent === 100 ? '' : rightDelim);
		buf += Broadcast.line(width - widthPercent, fillChar);
		buf += '</bold>' + rightDelim + closeColor;
		return buf;
	}

	/**
	 * Capitalize a message
	 * @param {string}  message
	 * @return {string}
	 */
	static capitalize(message: string) {
		if (typeof message === 'string') {
			const [first, ...rest] = message;
			return `${first.toUpperCase()}${rest.join('')}`;
		} else {
			return message;
		}
	}

	/**
	 * Return a simple channel reporter implementing Broadcastable
	 * @param {string}  name
	 * @return {string}
	 */
	static getSystemReporter(name: string = 'SYSTEM') {
		return {
			name,
			getBroadcastTargets() {
				return [];
			},
		};
	}

	/**
	 * Center a string in the middle of a given width
	 * @param {number} width
	 * @param {string} message
	 * @param {string} color
	 * @param {?string} fillChar Character to pad with, defaults to ' '
	 * @return {string}
	 */
	static center(
		width: number,
		message: string,
		color?: string,
		fillChar?: string
	) {
		const padWidth = width / 2 - message.length / 2;
		let openColor = '';
		let closeColor = '';
		if (color) {
			openColor = `<${color}>`;
			closeColor = `</${color}>`;
		}

		return (
			openColor +
			Broadcast.line(Math.floor(padWidth), fillChar || ' ') +
			message +
			Broadcast.line(Math.ceil(padWidth), fillChar || ' ') +
			closeColor
		);
	}

	/**
	 * Render a line of a specific width/color
	 * @param {number} width
	 * @param {string} fillChar
	 * @param {?string} color
	 * @return {string}
	 */
	static line(width: number, fillChar?: string, color?: string) {
		let openColor = '';
		let closeColor = '';
		if (color) {
			openColor = `<${color}>`;
			closeColor = `</${color}>`;
		}
		return openColor + new Array(width + 1).join(fillChar || '-') + closeColor;
	}

	/**
	 * Wrap a message to a given width. Note: Evaluates color tags
	 * @param {string}  message
	 * @param {?number} width   Defaults to 80
	 * @param {?number} indent left padding for wrapping lines
	 * @return {string}
	 */
	static wrap(message: string, width?: number) {
		return Broadcast._fixNewlines(wrap(ansi.parse(message), width || 80));
	}

	/**
	 * Indent all lines of a given string by a given amount
	 * @param {string} message
	 * @param {number} indent
	 * @return {string}
	 */
	static indent(message: string, indent: number) {
		message = Broadcast._fixNewlines(message);
		const padding = Broadcast.line(indent || 0, ' ');
		return padding + message.replace(/\r\n/g, '\r\n' + padding);
	}

	/**
	 * Fix LF unpaired with CR for windows output
	 * @param {string} message
	 * @param {?string} indent
	 * @return {string}
	 * @private
	 */
	static _fixNewlines(message: string) {
		// Fix \n not in a \r\n pair to prevent bad rendering on windows
		const messageArray = message.replace(/\r\n/g, '<NEWLINE>').split('\n');
		message = messageArray.join('\r\n').replace(/<NEWLINE>/g, '\r\n');
		// fix sty's incredibly stupid default of always appending ^[[0m
		return message.replace(/\x1B\[0m$/, '');
	}

	static isBroadcastable(source: Broadcastable) {
		return source && typeof source.getBroadcastTargets === 'function';
	}
}
