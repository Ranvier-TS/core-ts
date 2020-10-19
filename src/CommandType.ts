export const CommandType = {
	COMMAND: 'COMMAND',
	SKILL: 'SKILL',
	CHANNEL: 'CHANNEL',
	MOVEMENT: 'MOVEMENT',
} as const;

export type CommandType = typeof CommandType[keyof typeof CommandType];
