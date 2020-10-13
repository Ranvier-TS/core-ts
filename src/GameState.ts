import {
  AccountManager,
  AreaFactory,
  AreaManager,
  AttributeFactory,
  BehaviorManager,
  BundleManager,
  ChannelManager,
  CommandManager,
  Config,
  Data,
  DataSourceRegistry,
  EffectFactory,
  EntityLoaderRegistry,
  EventManager,
  GameServer,
  HelpManager,
  ItemFactory,
  ItemManager,
  MobFactory,
  MobManager,
  PartyManager,
  PlayerManager,
  QuestFactory,
  QuestGoalManager,
  QuestRewardManager,
  RoomFactory,
  RoomManager,
  SkillManager,
} from '.';

export interface IGameState {
  AccountManager: AccountManager;
  AreaBehaviorManager: BehaviorManager;
  AreaFactory: AreaFactory;
  AreaManager: AreaManager;
  AttributeFactory: AttributeFactory;
  BundleManager: BundleManager;
  ChannelManager: ChannelManager;
  CommandManager: CommandManager;
  Config: Config,
  EffectFactory: EffectFactory;
  HelpManager: HelpManager;
  InputEventManager: EventManager;
  ItemBehaviorManager: BehaviorManager;
  ItemFactory: ItemFactory;
  ItemManager: ItemManager;
  MobBehaviorManager: BehaviorManager;
  MobFactory: MobFactory;
  MobManager: MobManager;
  PartyManager: PartyManager;
  PlayerManager: PlayerManager;
  QuestFactory: QuestFactory;
  QuestGoalManager: QuestGoalManager;
  QuestRewardManager: QuestRewardManager;
  RoomBehaviorManager: BehaviorManager;
  RoomFactory: RoomFactory;
  RoomManager: RoomManager;
  SkillManager: SkillManager;
  ServerEventManager: EventManager;
  GameServer: GameServer;
  DataLoader: Data,
  EntityLoaderRegistry: EntityLoaderRegistry;
  DataSourceRegistry: DataSourceRegistry;
  [key: string]: any; // Not ideal, but fields can be dynamically added.
}
