export const PlayerRoles = {
	ADMIN: 2,
	BUILDER: 1,
	PLAYER: 0,
} as const;

export type PlayerRoles = typeof PlayerRoles[keyof typeof PlayerRoles];
