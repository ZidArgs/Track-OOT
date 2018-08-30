async function loadAll() {
    var buffer = await FileLoader.loadAllJSON([
        "database/items.json",
        "database/chests.json",
        "database/dungeons.json",
        "database/skulltulas.json",
        "database/logic.json",
        "database/rom_options.json",
        "database/lang_en.json"
    ]);
    var data = {};
    // items
    data.items = buffer[0];
    // chests, dungeons & skulltulas
    data.chests = buffer[1];
    data.dungeons = buffer[2];
    data.skulltulas = buffer[3];
    // logic
    data.logic = buffer[4];
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.rom_options = buffer[5];
    data.lang = buffer[6];
    return data;
}