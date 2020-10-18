/// <reference types="node" />
import { EventEmitter } from 'events';
import { TelnetStream } from '../types/TelnetStream';
import { WebsocketStream } from '../types/WebsocketStream';
/**
 * Base class for anything that should be sending or receiving data from the player
 */
export declare class TransportStream extends EventEmitter {
    socket?: TelnetStream | WebsocketStream;
    _prompted: boolean;
    get readable(): boolean;
    get writable(): boolean;
    write(message: string, encoding?: string): void;
    /**
     * A subtype-safe way to execute commands on a specific type of stream that invalid types will ignore. For given input
     * for command (example, `"someCommand"` ill look for a method called `executeSomeCommand` on the `TransportStream`
     * @param {string} command
     * @param {...*} args
     * @return {*}
     */
    command<T, K extends keyof T>(this: T, command: string, ...args: any[]): any;
    address(...args: [any]): null;
    end(...args: [any]): void;
    setEncoding(...args: [any]): void;
    pause(...args: [any]): void;
    resume(...args: [any]): void;
    destroy(...args: [any]): void;
    /**
     * Attach a socket to this stream
     * @param {*} socket
     */
    attach(socket: TelnetStream | WebsocketStream): void;
}
