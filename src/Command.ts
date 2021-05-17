import { CommandType } from './CommandType';
import { Npc } from './Npc';
import { Player } from './Player';
import { PlayerRoles } from './PlayerRoles';

export interface ICommandDef {
	name: string;
	func: Function;
	type?: CommandType;
	aliases?: string[];
	usage?: string;
	requiredRole?: PlayerRoles;
	metadata?: Record<string, any>;
	command: Function;
}

/**
 * In game command. See the {@link http://ranviermud.com/extending/commands/|Command guide}
 * @property {string} bundle Bundle this command came from
 * @property {CommandType} type
 * @property {string} name
 * @property {function} func Actual function that gets run when the command is executed
 * @property {Array<string>} aliases
 * @property {string} usage
 * @property {PlayerRoles} requiredRole
 * @property {Object} metadata General use configuration object
 */
export class Command {
	bundle: string;
	type: CommandType;
	name: string;
	func: Function;
	aliases?: string[];
	usage: string;
	requiredRole: PlayerRoles;
	file: string;
	metadata: Record<string, any>;

	/**
	 * @param {string} bundle Bundle the command came from
	 * @param {string} name   Name of the command
	 * @param {object} def
	 * @param {CommandType} def.type=CommandType.COMMAND
	 * @param {function} def.command
	 * @param {Array<string>} def.aliases
	 * @param {string} def.usage=this.name
	 * @param {PlayerRoles} requiredRole=PlayerRoles.PLAYER
	 * @param {string} file File the command comes from
	 */
	constructor(bundle: string, name: string, def: ICommandDef, file: string) {
		this.bundle = bundle;
		this.type = def.type || CommandType.COMMAND;
		this.name = name;
		this.func = def.command;
		this.aliases = def.aliases;
		this.usage = def.usage || this.name;
		this.requiredRole = def.requiredRole || PlayerRoles.PLAYER;
		this.file = file;
		this.metadata = def.metadata || {};
	}

	/**
	 * @param {string} args   A string representing anything after the command itself from what the user typed
	 * @param {Player} player Player that executed the command
	 * @param {string} arg0   The actual command the user typed, useful when checking which alias was used for a command
	 * @return {*}
	 */
	execute(
		args: string, player: Npc | Player, arg0: string = this.name
	) {
		return this.func(args, player, arg0);
	}
}
