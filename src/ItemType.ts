export const ItemType = {
	OBJECT: 1,
	CONTAINER: 2,
	ARMOR: 3,
	WEAPON: 4,
	POTION: 5,
	RESOURCE: 6,
	COMMUNICATOR: 7,
} as const;

export type ItemType = typeof ItemType[keyof typeof ItemType];
