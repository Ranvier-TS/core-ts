import { EventEmitter } from "events";

export type Constructor<T = EventEmitter> = new (...args: any[]) => T;

/**
 * From Puja's typescript-deep-path-safe repo
 * https://github.com/Pouja/typescript-deep-path-safe/blob/main/index.d.ts
 */
 export type DeepResolveType<ObjectType, Path extends string, OrElse> =
	Path extends keyof ObjectType
		? ObjectType[Path]
		: Path extends `${infer LeftSide}.${infer RightSide}`
			? LeftSide extends keyof ObjectType
				? DeepResolveType<ObjectType[LeftSide], RightSide, OrElse>
				: Path extends `${infer LeftSide}[${number}].${infer RightSide}`
					? LeftSide extends keyof ObjectType
						? ObjectType[LeftSide] extends Array<infer U>
							? DeepResolveType<U,RightSide, OrElse>
							: OrElse
						: OrElse
					: OrElse
				: Path extends `${infer LeftSide}[${number}]`
					? LeftSide extends keyof ObjectType
						? ObjectType[LeftSide] extends Array<infer U>
							? U
							: OrElse
						: OrElse
					: OrElse;

/**
 * Check to see if a given object is iterable
 * @param {Object} obj
 * @return {boolean}
 */
export function isIterable(obj: Iterable<unknown>) {
	return obj && typeof obj[Symbol.iterator] === 'function';
}
