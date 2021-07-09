import { StreamType } from './TransportStream';

const sty = require('sty');

type EventUtilReturn = (message: string) => void;

/**
 * Helper methods for colored output during input-events
 */
export class EventUtil {
	/**
	 * Generate a function for writing colored output to a socket
	 * @param {net.Socket} socket
	 * @return {function (string)}
	 */
	static genWrite(socket: StreamType | null): EventUtilReturn {
		return socket
			? (string: string) => socket.write(sty.parse(string))
			: (string: string) => {};
	}

	/**
	 * Generate a function for writing colored output to a socket with a newline
	 * @param {net.Socket} socket
	 * @return {function (string)}
	 */
	static genSay(socket: StreamType | null): EventUtilReturn {
		return socket
			? (string: string) => socket.write(sty.parse(string + '\r\n'))
			: (string: string) => {};
	}
}
