export const ItemType = {
	OBJECT: 'OBJECT',
	CONTAINER: 'CONTAINER',
	ARMOR: 'ARMOR',
	WEAPON: 'WEAPON',
	POTION: 'POTION',
	RESOURCE: 'RESOURCE',
	COMMUNICATOR: 'COMMUNICATOR',
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];
