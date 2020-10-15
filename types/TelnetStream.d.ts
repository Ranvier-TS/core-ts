import { TransportStream } from '../src/TransportStream';

/**
 * Thin wrapper around a ranvier-telnet `TelnetSocket`
 */
export declare class TelnetStream extends TransportStream {
	attach(socket: TelnetStream): void;

	write(message: string, encoding: string): void;

	pause(): void;

	resume(): void;

	end(): void;

	executeToggleEcho(): void;
}
