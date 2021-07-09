import { EventEmitter } from 'events';
import WebSocket from 'ws';

export declare class RanvierWebSocket extends EventEmitter {
	socket: WebSocket | null;
	echoing: boolean;
	ended: boolean;
	finished: boolean;
	fresh: boolean;
	readyState: number;
	readable: boolean;
	writable: boolean;

	constructor();

	attach(connection: WebSocket): void;

	write(message: string): void;

	pause(): void;

	resume(): void;

	end(): void;

	executeSendData(group: string, data: any): void;
}
