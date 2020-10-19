export const SkillType = {
	SKILL: 'SKILL',
	SPELL: 'SPELL',
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];