import { Player, Npc, Character, Item, Room, Area } from "../src";

export type PlayerOrNpc = Player | Npc;
export type AnyCharacter = Player | Npc | Character;
export type GameEntities = Item | Npc | Room;
export type CharacterAndItem = AnyCharacter | Item;
export type CharacterAndRoom = AnyCharacter | Room;
export type ObservableEntity = AnyCharacter | GameEntities;
export type AnyGameEntity = Item | Room | Area | Player | AnyCharacter;
export type QuestGiver = Area | Room | Npc | Item;
export type EffectTarget = AnyCharacter | Room | Area | Item;
export type BehaviorEntity = QuestGiver;
