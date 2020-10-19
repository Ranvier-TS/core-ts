export interface IHelpDef {
	bundle: string;
	name: string;
	options: IHelpOptionsDef;
}

export interface IHelpOptionsDef {
	keywords: string[];
	command?: string;
	channel?: string;
	related?: string[];
	aliases?: string[];
	body: string;
}

/**
 * Representation of an in game helpfile
 */
export class Helpfile {
	bundle: string;
	name: string;
	keywords: string[];
	command?: string;
	channel?: string;
	related: string[];
	body: string;
	aliases: string[];

	/**
	 * @param {string} bundle Bundle the helpfile comes from
	 * @param {string} name
	 * @param {object} options
	 * @param {Array<string>} [options.keywords]
	 * @param {string} [options.command]
	 * @param {string} [options.channel]
	 * @param {Array<string>} [options.related]
	 * @param {string} [options.tooltip]
	 * @param {string} options.body
	 */
	constructor(bundle: string, name: string, options: IHelpOptionsDef) {
		this.bundle = bundle;
		this.name = name;

		if (!options || !options.body) {
			throw new Error(`Help file [${name}] has no content.`);
		}

		this.keywords = options.keywords || [name];
		this.command = options.command;
		this.channel = options.channel;
		this.related = options.related || [];
		this.body = options.body;
		this.aliases = options.aliases || [];
	}
}
