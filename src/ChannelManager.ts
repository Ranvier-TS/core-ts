import { Channel } from './Channel';

/**
 * Contains registered channels
 *
 * TODO: should probably refactor this to just extend `Map`
 */
export class ChannelManager {
	channels: Map<string, Channel>;
	constructor() {
		this.channels = new Map();
	}

	/**
	 * @param {string} name Channel name
	 * @return {Channel}
	 */
	get(name: string) {
		return this.channels.get(name);
	}

	/**
	 * @param {Channel} channel
	 */
	add(channel: Channel) {
		this.channels.set(channel.name, channel);
		if (channel.aliases) {
			channel.aliases.forEach((alias) => this.channels.set(alias, channel));
		}
	}

	/**
	 * @param {Channel} channel
	 */
	remove(channel: Channel) {
		this.channels.delete(channel.name);
	}

	/**
	 * @param {string} search
	 * @return {Channel}
	 */
	find(search: string) {
		for (const [name, channel] of this.channels.entries()) {
			if (name.indexOf(search) === 0) {
				return channel;
			}
		}
	}
}
