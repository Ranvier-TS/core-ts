"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountManager = void 0;
const Account_1 = require("./Account");
/**
 * Creates/loads {@linkplain Account|Accounts}
 * @property {Map<string,Account>} accounts
 * @property {EntityLoader} loader
 */
class AccountManager {
    constructor() {
        this.accounts = new Map();
        this.loader = null;
    }
    /**
     * Set the entity loader from which accounts are loaded
     * @param {EntityLoader}
     */
    setLoader(loader) {
        this.loader = loader;
    }
    /**
     * @param {Account} account
     */
    addAccount(account) {
        this.accounts.set(account.username, account);
    }
    /**
     * @param {string} username
     * @return {Account}
     */
    getAccount(username) {
        const account = this.accounts.get(username);
        if (!account) {
            throw new Error(`AccountManager can't find the Account [${username}]`);
        }
        return account;
    }
    /**
     * @param {string} username
     * @param {boolean} force Force reload data from disk
     */
    async loadAccount(username, force) {
        if (this.accounts.has(username) && !force) {
            return this.getAccount(username);
        }
        if (!this.loader) {
            throw new Error('No entity loader configured for accounts');
        }
        const data = await this.loader.fetch(username);
        let account = new Account_1.Account(data);
        this.addAccount(account);
        return account;
    }
}
exports.AccountManager = AccountManager;
