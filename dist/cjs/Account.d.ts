/// <reference types="node" />
import { EventEmitter } from 'events';
import { AccountManager } from './AccountManager';
import { Metadata } from './Metadatable';
export interface IAccountConfig {
    /** @property {string} username */
    username: string;
    /** @property {Array<string>} characters List of character names in this account */
    characters?: string[];
    /** @property {string} password Hashed password */
    password: string;
    /** @property {boolean} banned Whether this account is banned or not */
    banned?: boolean;
    /** @property {boolean} deleted Whether this account is deleted or not */
    deleted?: boolean;
    metadata?: Metadata;
}
export interface ISerializedAccount {
    username: string;
    characters: IAccountCharacter[];
    password: string;
    metadata: Metadata;
    banned: boolean;
    deleted: boolean;
}
export interface IAccountCharacter {
    username: string;
    deleted: boolean;
}
declare const Account_base: {
    new (...args: any[]): {
        metadata?: Record<string, any> | undefined;
        setMeta(key: string, value: any): void;
        getMeta(key: string): Record<string, any>;
        addListener(event: string | symbol, listener: (...args: any[]) => void): any;
        on(event: string | symbol, listener: (...args: any[]) => void): any;
        once(event: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
        off(event: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(event: string | symbol): Function[];
        rawListeners(event: string | symbol): Function[];
        emit(event: string | symbol, ...args: any[]): boolean;
        listenerCount(type: string | symbol): number;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
} & typeof EventEmitter;
/**
 * Representation of a player's account
 *
 * @property {string} username
 * @property {Array<string>} characters List of character names in this account
 * @property {string} password Hashed password
 * @property {boolean} banned Whether this account is banned or not
 */
export declare class Account extends Account_base {
    /** @property {string} username */
    username: string;
    /** @property {Array<string>} characters List of character names in this account */
    characters: IAccountCharacter[];
    /** @property {string} password Hashed password */
    password: string;
    /** @property {boolean} banned Whether this account is banned or not */
    banned: boolean;
    /** @property {boolean} deleted Whether this account is deleted or not */
    deleted: boolean;
    /** @property {object} metadata */
    metadata: Metadata;
    __manager?: AccountManager;
    /**
     * @param {Object} data Account save data
     */
    constructor(data: ISerializedAccount);
    /**
     * @return {string}
     */
    getUsername(): string;
    /**
     * @param {string} username
     */
    addCharacter(username: string): void;
    /**
     * @param {string} name
     * @return {boolean}
     */
    hasCharacter(name: string): boolean;
    /**
     * @param {string} name Delete one of the chars
     */
    deleteCharacter(name: string): void;
    /**
     * @param {string} name Removes the deletion of one of the chars
     */
    undeleteCharacter(name: string): void;
    /**
     * @param {string} password Unhashed password. Is hashed inside this function
     */
    setPassword(pass: string): void;
    /**
     * @param {string} pass Unhashed password to check against account's password
     * @return {boolean}
     */
    checkPassword(pass: string): boolean;
    save(): void;
    /**
   * Set this account to banned
    There is no unban because this can just be done by manually editing the account file
   */
    ban(): void;
    /**
   * Set this account to deleted
   There is no undelete because this can just be done by manually editing the account file
   */
    deleteAccount(): void;
    /**
     * @private
     * @param {string} pass
     * @return {string} Hashed password
     */
    _hashPassword(pass: string): string;
    /**
     * Gather data from account object that will be persisted to disk
     *
     * @return {Object}
     */
    serialize(): ISerializedAccount;
}
export {};
