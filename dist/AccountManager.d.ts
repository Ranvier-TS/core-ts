import { Account } from './Account';
import { EntityLoader } from './EntityLoader';
/**
 * Creates/loads {@linkplain Account|Accounts}
 * @property {Map<string,Account>} accounts
 * @property {EntityLoader} loader
 */
export declare class AccountManager {
    /** @property {Map<string,Account>} accounts */
    accounts: Map<string, Account>;
    /** @property {EntityLoader} loader */
    loader: EntityLoader | null;
    constructor();
    /**
     * Set the entity loader from which accounts are loaded
     * @param {EntityLoader}
     */
    setLoader(loader: EntityLoader): void;
    /**
     * @param {Account} account
     */
    addAccount(account: Account): void;
    /**
     * @param {string} username
     * @return {Account}
     */
    getAccount(username: string): Account;
    /**
     * @param {string} username
     * @param {boolean} force Force reload data from disk
     */
    loadAccount(username: string, force: boolean): Promise<Account>;
}
