import { PlayerOrNpc } from './GameEntity';
/**
 * Representation of an adventuring party
 */
export declare class Party extends Set<PlayerOrNpc> {
    invited: Set<PlayerOrNpc>;
    leader: PlayerOrNpc;
    constructor(leader: PlayerOrNpc);
    delete(member: PlayerOrNpc): boolean;
    add(member: PlayerOrNpc): this;
    disband(): void;
    invite(target: PlayerOrNpc): void;
    isInvited(target: PlayerOrNpc): boolean;
    removeInvite(target: PlayerOrNpc): void;
    getBroadcastTargets(): PlayerOrNpc[];
}
