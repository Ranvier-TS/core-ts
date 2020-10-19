import { Area } from './Area';
import { Character, ICharacterConfig } from './Character';
import { CommandQueue } from './CommandQueue';
import { EntityReference } from './EntityReference';
import { IGameState } from './GameState';
import { Room } from './Room';
export interface INpcDef extends ICharacterConfig {
    script?: string;
    behaviors?: Record<string, any>;
    equipment?: Record<string, {
        entityRefence: EntityReference;
    }>;
    items?: EntityReference[];
    description: string;
    entityReference: EntityReference;
    id: string | number;
    keywords: string[];
    quests?: EntityReference[];
    uuid?: string;
}
declare const Npc_base: {
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
        evaluateIncomingDamage(damage: import("./Damage").Damage, currentAmount: number, attacker?: import("./Player").Player | Npc | undefined): number;
        evaluateOutgoingDamage(damage: import("./Damage").Damage, currentAmount: number, target: import("./GameEntity").PlayerOrNpc): number;
        hydrate(state: IGameState, serialized?: {}): void;
        serialize(): {
            attributes: Record<string, import("./Attribute").ISerializedAttribute>;
            effects: import("./Effect").ISerializedEffect[];
        };
        addListener(event: string | symbol, listener: (...args: any[]) => void): any;
        on(event: string | symbol, listener: (...args: any[]) => void): any;
        once(event: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(event: string | symbol, listener: (...args: any[]) => void): any;
        off(event: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any; /**
         * @event Npc#enterRoom
         * @param {Room} room
         */
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(event: string | symbol): Function[];
        rawListeners(event: string | symbol): Function[];
        listenerCount(type: string | symbol): number;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
} & typeof Character;
/**
 * @property {number} id   Area-relative id (vnum)
 * @property {Area}   area Area npc belongs to (not necessarily the area they're currently in)
 * @property {Map} behaviors
 * @extends Character
 * @mixes Scriptable
 */
export declare class Npc extends Npc_base {
    area: Area;
    script?: string;
    behaviors?: Map<string, any>;
    defaultEquipment: Record<string, {
        entityRefence: EntityReference;
    }>;
    defaultItems: EntityReference[];
    description: string;
    entityReference: EntityReference;
    id: number | string;
    quests: EntityReference[];
    uuid: string;
    commandQueue: CommandQueue;
    keywords: string[];
    sourceRoom: Room | null;
    __pruned: boolean;
    constructor(area: Area, data: INpcDef);
    /**
     * Move the npc to the given room, emitting events appropriately
     * @param {Room} nextRoom
     * @param {function} onMoved Function to run after the npc is moved to the next room but before enter events are fired
     * @fires Room#npcLeave
     * @fires Room#npcEnter
     * @fires Npc#enterRoom
     */
    moveTo(nextRoom: Room, onMoved?: any): void;
    hydrate(state: IGameState): {
        script: string | undefined;
        behaviors: Map<unknown, unknown>;
        defaultEquipment: Record<string, {
            entityRefence: string;
        }>;
        defaultItems: string[];
        keywords: string[];
        quests: string[];
        metadata: Record<string, any> | undefined;
    };
    get isNpc(): boolean;
}
export {};
