export const EffectFlag = {
	BUFF: 'BUFF',
	DEBUFF: 'DEBUFF',
} as const;

export type EffectFlag = typeof EffectFlag[keyof typeof EffectFlag];
