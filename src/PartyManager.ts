import { PlayerOrNpc } from './GameEntity';
import { Party } from './Party';

/**
 * Keeps track of active in game parties and is used to create new parties
 * @extends Set
 */
export class PartyManager extends Set<Party> {
	/**
	 * Create a new party from with a given leader
	 * @param {Player} leader
	 */
	create(leader: PlayerOrNpc) {
		const party = new Party(leader);
		this.add(party);
	}

	/**
	 * @param {Party} party
	 */
	disband(party: Party | null) {
		if (party) {
			this.delete(party);
			party.disband();
			party = null;
		}
	}
}
