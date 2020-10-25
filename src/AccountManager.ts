import { Account } from './Account';
import { EntityLoader } from './EntityLoader';

/**
 * Creates/loads {@linkplain Account|Accounts}
 * @property {Map<string,Account>} accounts
 * @property {EntityLoader} loader
 */
export class AccountManager {
	/** @property {Map<string,Account>} accounts */
	accounts: Map<string, Account>;
	/** @property {EntityLoader} loader */
	loader: EntityLoader | null;

	constructor() {
		this.accounts = new Map();
		this.loader = null;
	}

	/**
	 * Set the entity loader from which accounts are loaded
	 * @param {EntityLoader}
	 */
	setLoader(loader: EntityLoader) {
		this.loader = loader;
	}

	/**
	 * @param {Account} account
	 */
	addAccount(account: Account) {
		this.accounts.set(account.username, account);
	}

	/**
	 * @param {string} username
	 * @return {Account}
	 */
	getAccount(username: string) {
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
	async loadAccount(username: string, force?: boolean) {
		if (this.accounts.has(username) && !force) {
			return this.getAccount(username);
		}

		if (!this.loader) {
			throw new Error('No entity loader configured for accounts');
		}

		const data = await this.loader.fetch(username);

		let account = new Account(data);
		this.addAccount(account);

		return account;
  }
}
