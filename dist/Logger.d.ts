/**
 * Wrapper around Winston
 */
export declare class Logger {
    static getLevel(): any;
    static setLevel(level: string): void;
    static log(...messages: any): void;
    static error(...messages: any): void;
    static warn(...messages: any): void;
    static verbose(...messages: any): void;
    static setFileLogging(path: string): void;
    static deactivateFileLogging(): void;
    static enablePrettyErrors(): void;
}
