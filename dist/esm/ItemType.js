export var ItemType;
(function (ItemType) {
    ItemType[ItemType["OBJECT"] = 1] = "OBJECT";
    ItemType[ItemType["CONTAINER"] = 2] = "CONTAINER";
    ItemType[ItemType["ARMOR"] = 3] = "ARMOR";
    ItemType[ItemType["WEAPON"] = 4] = "WEAPON";
    ItemType[ItemType["POTION"] = 5] = "POTION";
    ItemType[ItemType["RESOURCE"] = 6] = "RESOURCE";
    ItemType[ItemType["COMMUNICATOR"] = 7] = "COMMUNICATOR";
})(ItemType || (ItemType = {}));
