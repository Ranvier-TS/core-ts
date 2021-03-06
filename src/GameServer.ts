import { EventEmitter } from 'events';

export class GameServer extends EventEmitter {
	/**
	 * @param {commander} commander
	 * @fires GameServer#startup
	 */
	startup(commander: object) {
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
