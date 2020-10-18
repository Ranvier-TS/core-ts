import { Area } from './Area';
import { EffectableEntity } from './EffectableEntity';
import { Item } from './Item';
import { Npc } from './Npc';
import { Player } from './Player';
import { Room } from './Room';
declare const GameEntity_base: {
    new (...args: any[]): {
        behaviors?: Map<string, any> | undefined;
        emit(name: string, ...args: any): boolean;
        hasBehavior(name: string): boolean | undefined;
        getBehavior(name: string): any;
        setupBehaviors(manager: import("./BehaviorManager").BehaviorManager): void;
        effects: import("./EffectList").EffectList;
        attributes: import("./Attributes").Attributes;
        readonly __attributes: Record<string, import("./Attribute").ISerializedAttribute>;
        __hydrated: boolean;
        hasAttribute(attr: string): boolean;
        getMaxAttribute(attrString: string): number;
        addAttribute(attr: import("./Attribute").Attribute): void;
        getAttribute(attrName: string): number;
        getProperty(propertyName: string): number;
        getBaseAttribute(attrName: string): number | undefined;
        setAttributeToMax(attrString: string): void;
        raiseAttribute(attrString: string, amount: number): void;
        lowerAttribute(attrString: string, amount: number): void;
        setAttributeBase(attrString: string, newBase: number): void;
        hasEffectType(type: string): boolean;
        addEffect(effect: import("./Effect").Effect): boolean;
        removeEffect(effect: import("./Effect").Effect): void;
        evaluateIncomingDamage(damage: import("./Damage").Damage, currentAmount: number, attacker?: Player | Npc | undefined): number;
        evaluateOutgoingDamage(damage: import("./Damage").Damage, currentAmount: number, target: PlayerOrNpc): number;
        hydrate(state: import("./GameState").IGameState, serialized?: {}): void;
        serialize(): {
            attributes: Record<string, import("./Attribute").ISerializedAttribute>;
            effects: import("./Effect").ISerializedEffect[];
        };
        addListener(event: string | symbol, listener: (...args: any[]) => void): any;
        on(event: string | symbol, listener: (...args: any[]) => void): any;
        once(event: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
        off(event: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(event: string | symbol): Function[];
        rawListeners(event: string | symbol): Function[];
        listenerCount(type: string | symbol): number;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
} & {
    new (...args: any[]): {
        metadata?: Record<string, any> | undefined;
        setMeta(key: string, value: any): void;
        getMeta(key: string): Record<string, any>;
        addListener(event: string | symbol, listener: (...args: any[]) => void): any;
        on(event: string | symbol, listener: (...args: any[]) => void): any;
        once(event: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
        off(event: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(event: string | symbol): Function[];
        rawListeners(event: string | symbol): Function[];
        emit(event: string | symbol, ...args: any[]): boolean;
        listenerCount(type: string | symbol): number;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
} & typeof EffectableEntity;
/**
 * @extends EventEmitter
 * @mixes Metadatable
 * @mixes Scriptable
 */
export declare class GameEntity extends GameEntity_base {
}
export declare type PlayerOrNpc = Player | Npc;
export declare type GameEntities = Item | Npc | Room;
export declare type AnyGameEntity = Item | Npc | Room | Area | Player;
export interface PruneableEntity {
    __pruned?: boolean;
}
export {};
