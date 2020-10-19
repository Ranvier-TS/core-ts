import * as net from 'net';
import { EventEmitter } from 'events';

export enum Seq {
	IAC = 255,
	DONT = 254,
	DO = 253,
	WONT = 252,
	WILL = 251,
	SB = 250,
	SE = 240,
	GA = 249,
	EOR = 239,
}

export enum Opts {
	OPT_ECHO = 1,
	OPT_EOR = 25,
	OPT_GMCP = 201,
}

export interface ITelnetOptions {
	maxInputLength?: number;
}

export declare class TelnetSocket extends EventEmitter {
	socket: net.Socket;
	maxInputLength: number;
	echoing: boolean;
	gaMode: Seq;
	readonly readable: boolean;
	readonly writeable: boolean;

	constructor(opts: ITelnetOptions);

	address(): string | net.AddressInfo;

	end(string: string | Uint8Array, enc: () => void): void;

	write(data: string, encoding: BufferEncoding): void;

	setEncoding(encoding: BufferEncoding): void;

	pause(): void;

	resume(): void;

	destroy(): void;

	/**
	 * Execute a telnet command
	 * @param {number}       willingness DO/DONT/WILL/WONT
	 * @param {number|Array} command     Option to do/don't do or subsequence as array
	 */
	telnetCommand(willingness: number, command: number | number[]): void;

	toggleEcho(): void;

	/**
	 * Send a GMCP message
	 * https://www.gammon.com.au/gmcp
	 *
	 * @param {string} gmcpPackage
	 * @param {*}      data        JSON.stringify-able data
	 */
	sendGMCP(gmcpPackage: string, data: any): void;

	attach(connection: any): void;

	/**
	 * Parse telnet input socket, swallowing any negotiations
	 * and emitting clean, fresh data
	 *
	 * @param {Buffer} inputbuf
	 *
	 * @fires TelnetSocket#DO
	 * @fires TelnetSocket#DONT
	 * @fires TelnetSocket#GMCP
	 * @fires TelnetSocket#SUBNEG
	 * @fires TelnetSocket#WILL
	 * @fires TelnetSocket#WONT
	 * @fires TelnetSocket#data
	 * @fires TelnetSocket#unknownAction
	 */
	input(inputbuf: Buffer): void;
}

export declare class TelnetServer {
	netServer: net.Server;
	/**
	 * @param {function} listener   connected callback
	 */
	constructor(listener: Function);
}
