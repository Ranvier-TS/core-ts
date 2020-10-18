import { BehaviorManager } from './BehaviorManager';
import { EffectableEntity } from './EffectableEntity';
import { Constructor } from './Util';
/**
 * @ignore
 * @exports ScriptableFn
 * @param {*} parentClass
 * @return {module:ScriptableFn~Scriptable}
 */
export declare const Scriptable: <TBase extends Constructor<EffectableEntity>>(ParentClass: TBase) => {
    new (...args: any[]): {
        behaviors?: Map<string, any> | undefined;
        emit(name: string, ...args: any): boolean;
        /**
         * @param {string} name
         * @return {boolean}
         */
        hasBehavior(name: string): boolean | undefined;
        /**
         * @param {string} name
         * @return {*}
         */
        getBehavior(name: string): any;
        /**
         * Attach this entity's behaviors from the manager
         * @param {BehaviorManager} manager
         */
        setupBehaviors(manager: BehaviorManager): void;
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
        evaluateIncomingDamage(damage: import("./Damage").Damage, currentAmount: number, attacker?: import("./Player").Player | import("./Npc").Npc | undefined): number;
        evaluateOutgoingDamage(damage: import("./Damage").Damage, currentAmount: number, target: import("./GameEntity").PlayerOrNpc): number;
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
} & TBase;
