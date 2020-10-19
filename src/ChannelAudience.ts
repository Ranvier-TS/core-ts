/**
 * Classes representing various channel audiences
 *
 * See the {@link http://ranviermud.com/extending/channels/|Channel guide} for usage
 * @namespace ChannelAudience
 */

import { Area } from './Area';
import { Character } from './Character';
import { AnyGameEntity, PlayerOrNpc } from './GameEntity';
import { IGameState } from './GameState';
import { Npc } from './Npc';
import { Player } from './Player';
import { Room } from './Room';

export type AreaBroadcastable = Player | Npc | Room | Area;

export interface AudienceOptions {
	/** @param {GameState} state */
	state: IGameState;
	/** @param {Character} sender */
	sender: PlayerOrNpc;
	/** @param {string} message */
	message: string;
}

/**
 * Base channel audience class
 */
export class ChannelAudience {
	/** @param {GameState} state */
	state?: IGameState;
	/** @param {Character} sender */
	sender?: PlayerOrNpc;
	/** @param {string} message */
	message: string = '';
	constructor(...args: any[]) {}
	/**
	 * Configure the current state for the audience. Called by {@link Channel#send}
	 * @param {object} options
	 * @param {GameState} options.state
	 * @param {Character} options.sender
	 * @param {string} options.message
	 */
	configure(options: AudienceOptions) {
		this.state = options.state;
		this.sender = options.sender;
		this.message = options.message;
	}

	/**
	 * Find targets for this audience
	 * @return {Array<Player>}
	 */
	getBroadcastTargets(): AnyGameEntity[] {
		return this.state?.PlayerManager.getPlayersAsArray() || [];
	}

	/**
	 * Modify the message to be sent
	 * @param {string} message
	 * @return {string}
	 */
	alterMessage(message: string) {
		return message;
	}
}
