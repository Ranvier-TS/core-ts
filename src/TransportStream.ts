import { EventEmitter } from 'events';
import { TelnetStream } from '../types/TelnetStream';
import { TelnetSocket } from '../types/TelnetSocket';
import { RanvierWebSocket } from '../types/RanvierWebSocket';
import { WebsocketStream } from '../types/WebsocketStream';

export type StreamType = TelnetStream | WebsocketStream;
export type SocketType = TelnetSocket | RanvierWebSocket;
/**
 * Base class for anything that should be sending or receiving data from the player
 */
export class TransportStream extends EventEmitter {
	socket?: SocketType;
	_prompted: boolean = false;

	get readable() {
		return true;
	}

	get writable() {
		return true;
	}

	write(message: string, encoding?: string) {
		/* noop */
	}

	/**
	 * A subtype-safe way to execute commands on a specific type of stream that invalid types will ignore. For given input
	 * for command (example, `"someCommand"` ill look for a method called `executeSomeCommand` on the `TransportStream`
	 * @param {string} command
	 * @param {...*} args
	 * @return {*}
	 */
	command<T, K extends keyof T>(this: T, command: string, ...args: any[]): any {
		if (!command || !command.length) {
			throw new RangeError('Must specify a command to the stream');
		}

		const methodName = 'execute' + command[0].toUpperCase() + command.substr(1);
		if (typeof this[methodName as K] === 'function') {
			const commandMethod = this[methodName as K] as unknown as (
				...args: any[]
			) => any;
			return commandMethod.call(this, ...args);
		}
	}

	address(...args: any[]) {
		return null;
	}

	end(...args: any[]) {
		/* noop */
	}

	setEncoding(...args: any[]) {
		/* noop */
	}

	pause(...args: any[]) {
		/* noop */
	}

	resume(...args: any[]) {
		/* noop */
	}

	destroy(...args: any[]) {
		/* noop */
	}

	/**
	 * Attach a socket to this stream
	 * @param {*} socket
	 */
	attach(socket: SocketType) {
		this.socket = socket;

		this.socket.on('close', (_?: any) => {
			this.emit('close');
		});
	}
}
