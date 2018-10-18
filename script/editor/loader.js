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
    data.items = buffer.shift();
    // chests, dungeons & skulltulas
    data.chests = buffer.shift();
    data.dungeons = buffer.shift();
    data.skulltulas = buffer.shift();
    // logic
    data.logic = buffer.shift();
    data.logic_patched = Storage.get("settings", "logic", {});
    // misc
    data.rom_options = buffer.shift();
    data.lang = buffer.shift();
    return data;
}