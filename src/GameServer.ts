import { EventEmitter } from 'events';
import { IGameState } from './GameState';
import { CommanderStatic } from 'commander';

export class GameServer extends EventEmitter {
	/**
	 * @param {commander} commander
	 * @fires GameServer#startup
	 */
	startup(commander: CommanderStatic) {
		/**
		 * @event GameServer#startup
		 * @param {commander} commander
		 */
		this.emit('startup', commander);
	}

	/**
	 * @fires GameServer#shutdown
	 */
	shutdown() {
		/**
		 * @event GameServer#shutdown
		 */
		this.emit('shutdown');
	}
}

export interface IGameServerEvent {
    listeners: {
        shutdown?: (state: IGameState) => () => void;
        startup?: (state: IGameState) => (commander: CommanderStatic) => void;
    };
}
