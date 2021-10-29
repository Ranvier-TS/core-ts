import { TransportStream } from '../src/TransportStream';
import { TelnetSocket } from './TelnetSocket';

/**
 * Thin wrapper around a ranvier-telnet `TelnetSocket`
 */
export declare class TelnetStream extends TransportStream {
	attach(socket: TelnetSocket): void;

	write(message: string, encoding?: string): void;

	pause(): void;

	resume(): void;

	end(): void;

	executeToggleEcho(): void;
}
