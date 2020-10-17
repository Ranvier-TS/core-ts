import { PlayerOrNpc } from './GameEntity';

/**
 * Representation of an adventuring party
 */
export class Party extends Set<PlayerOrNpc> {
	invited: Set<PlayerOrNpc>;
	leader: PlayerOrNpc;
	constructor(leader: PlayerOrNpc) {
		super();
		this.invited = new Set();
		this.leader = leader;
		this.add(leader);
	}

	delete(member: PlayerOrNpc) {
		const deleted = super.delete(member);
		member.party = null;
		return deleted;
	}

	add(member: PlayerOrNpc) {
		const added = super.add(member);
		member.party = this;
		this.invited.delete(member);
		return added;
	}

	disband() {
		for (const member of this) {
			this.delete(member);
		}
	}

	invite(target: PlayerOrNpc) {
		this.invited.add(target);
	}

	isInvited(target: PlayerOrNpc) {
		return this.invited.has(target);
	}

	removeInvite(target: PlayerOrNpc) {
		this.invited.delete(target);
	}

	getBroadcastTargets() {
		return [...this];
	}
}
