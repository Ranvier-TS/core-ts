export const SkillFlag = {
	PASSIVE: 'PASSIVE',
	ACTIVE: 'ACTIVE',
} as const;

export type SkillFlag = typeof SkillFlag[keyof typeof SkillFlag];
