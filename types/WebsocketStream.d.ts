import { TransportStream } from '../src/TransportStream';

/**
 * Essentially we want to look at the methods of WebSocket and match them to the appropriate methods on TransportStream
 */
export declare class WebsocketStream extends TransportStream {
	attach(socket: any): void;

	write(message: string): void;

	pause(): void;

	resume(): void;

	end(): void;

	executeToggleEcho(): void;

	executeSendData(group: string, data: any): void;
}
