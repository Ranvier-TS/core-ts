import { EventEmitter } from 'events';
import { Metadatable } from './Metadatable';
const bcrypt = require('bcryptjs');
/**
 * Representation of a player's account
 *
 * @property {string} username
 * @property {Array<string>} characters List of character names in this account
 * @property {string} password Hashed password
 * @property {boolean} banned Whether this account is banned or not
 */
export class Account extends Metadatable(EventEmitter) {
    /**
     * @param {Object} data Account save data
     */
    constructor(data) {
        super();
        this.username = data.username;
        this.characters = data.characters || [];
        this.password = data.password;
        this.banned = data.banned || false;
        this.deleted = data.deleted || false;
        // Arbitrary data bundles are free to shove whatever they want in
        // WARNING: values must be JSON.stringify-able
        this.metadata = data.metadata || {};
    }
    /**
     * @return {string}
     */
    getUsername() {
        return this.username;
    }
    /**
     * @param {string} username
     */
    addCharacter(username) {
        this.characters.push({ username, deleted: false });
    }
    /**
     * @param {string} name
     * @return {boolean}
     */
    hasCharacter(name) {
        return !!this.characters.find((c) => c.username === name);
    }
    /**
     * @param {string} name Delete one of the chars
     */
    deleteCharacter(name) {
        const picked = this.characters.find((c) => c.username === name);
        if (picked) {
            picked.deleted = true;
            this.save();
        }
    }
    /**
     * @param {string} name Removes the deletion of one of the chars
     */
    undeleteCharacter(name) {
        const picked = this.characters.find((c) => c.username === name);
        if (picked) {
            picked.deleted = false;
            this.save();
        }
    }
    /**
     * @param {string} password Unhashed password. Is hashed inside this function
     */
    setPassword(pass) {
        this.password = this._hashPassword(pass);
        this.save();
    }
    /**
     * @param {string} pass Unhashed password to check against account's password
     * @return {boolean}
     */
    checkPassword(pass) {
        return bcrypt.compareSync(pass, this.password);
    }
    save() {
        var _a, _b;
        (_b = (_a = this.__manager) === null || _a === void 0 ? void 0 : _a.loader) === null || _b === void 0 ? void 0 : _b.update(this.username, this.serialize());
    }
    /**
   * Set this account to banned
    There is no unban because this can just be done by manually editing the account file
   */
    ban() {
        this.banned = true;
        this.save();
    }
    /**
   * Set this account to deleted
   There is no undelete because this can just be done by manually editing the account file
   */
    deleteAccount() {
        this.characters.forEach((char) => {
            this.deleteCharacter(char.username);
        });
        this.deleted = true;
        this.save();
    }
    /**
     * @private
     * @param {string} pass
     * @return {string} Hashed password
     */
    _hashPassword(pass) {
        const salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(pass, salt);
    }
    /**
     * Gather data from account object that will be persisted to disk
     *
     * @return {Object}
     */
    serialize() {
        const { username, characters, password, metadata, banned, deleted } = this;
        return {
            username,
            characters,
            password,
            metadata,
            banned,
            deleted,
        };
    }
}
