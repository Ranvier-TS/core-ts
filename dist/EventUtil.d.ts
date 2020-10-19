import { TransportStream } from './TransportStream';
/**
 * Helper methods for colored output during input-events
 */
export declare class EventUtil {
    /**
     * Generate a function for writing colored output to a socket
     * @param {net.Socket} socket
     * @return {function (string)}
     */
    static genWrite(socket: TransportStream): (string: string) => void;
    /**
     * Generate a function for writing colored output to a socket with a newline
     * @param {net.Socket} socket
     * @return {function (string)}
     */
    static genSay(socket: TransportStream): (string: string) => void;
}
