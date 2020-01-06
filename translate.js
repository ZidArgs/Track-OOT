const fs = require('fs');

const LOCATION_STRUCT = {
    "type": "chest",
    "time": "always",
    "child": true,
    "adult": true,
    "visible": true,
    "access": false
}

const ENTRANCE_STRUCT = {
    "type": "interior",
    "time": "always",
    "child": true,
    "adult": true,
    "visible": true,
    "access": false
}

// transformed database
let translation = JSON.parse(fs.readFileSync("./_old/buffer/translation.json"));
let locations = JSON.parse(fs.readFileSync("./_old/buffer/locations.json"));
let items = JSON.parse(fs.readFileSync("./_old/database/items.json"));
let settings = JSON.parse(fs.readFileSync("./_old/database/settings.json"));
let shops = JSON.parse(fs.readFileSync("./_old/database/shops.json"));
let songs = JSON.parse(fs.readFileSync("./_old/database/songs.json"));
let logic = JSON.parse(fs.readFileSync("./_old/database/logic.json"));

// copied database
fs.writeFileSync("./src/database/filter.json", fs.readFileSync("./_old/database/filter.json"));
fs.writeFileSync("./src/database/grids.json", fs.readFileSync("./_old/database/grids.json"));
fs.writeFileSync("./src/database/hints.json", fs.readFileSync("./_old/database/hints.json"));
fs.writeFileSync("./src/database/layouts.json", fs.readFileSync("./_old/database/layouts.json"));
fs.writeFileSync("./src/database/shop_items.json", fs.readFileSync("./_old/database/shop_items.json"));

// language
let lang_en = fs.readFileSync("./_old/i18n/en_us.lang", "utf8");
let lang_en2 = fs.readFileSync("./_old/i18n/en_us.easy.lang", "utf8");
let lang_de = fs.readFileSync("./_old/i18n/de_de.lang", "utf8");

function translateValue(val) {
    if (Array.isArray(val)) {
        for (let i in val) {
            if (translation.hasOwnProperty(val[i])) {
                return translation[val[i]];
            }
        }
    } else {
        if (translation.hasOwnProperty(val)) {
            return translation[val];
        }
        return val;
    }
}

let world = {
    "locations": {},
    "areas": {},
    "entrances": {}
};
let maps = {
    "": {
        "background": "main.png",
        "locations": [],
    }
}
let locationlists = {
    "": []
}
let citems = {};
let csettings = {
    "settings": settings.settings,
    "options": {},
    "skips": {}
};
let cshops = {};
let csongs = {};
let clogic = {};

function convert_locations(area, name, type, data) {
    let area_name = translateValue(area);
    let trans = translateValue(`${type}.${name}`);
    let record = Object.assign({}, LOCATION_STRUCT);
    record.type = type.replace(/s$/, "");
    record.access = `logic.${trans}`;

    if (!!data.mode) {
        record.type = data.mode.slice(0, -6);
        record.visible = {
            "type": "number",
            "el": `option.${data.mode}`
        };
    }
    if (!!data.era) {
        if (data.era == "child") {
            record.adult = false;
        } else if (data.era == "adult") {
            record.child = false;
        }
    }

    if (!!data.time) {
        record.time = data.time;
    }
    if (world.locations.hasOwnProperty(trans)) {
        console.error(`name duplication: ${trans}`);
    }
    world.locations[trans] = record;
    world.areas[area_name].locations.push(trans);

    if (!!data.x && !!data.y) {
        maps[""].locations.push({
            "type": type.replace(/s$/, ""),
            "id": trans,
            "x": Math.round(19.2 * parseFloat(data.x)),
            "y": Math.round(10.8 * parseFloat(data.y))
        });
    }
    locationlists[area_name].push({
        "type": type.replace(/s$/, ""),
        "id": trans
    });
    maps[area_name].locations.push({
        "type": type.replace(/s$/, ""),
        "id": trans,
        "x": 0,
        "y": 0
    });
}

function convert_entrance(area, name, data) {
    let area_name = translateValue(area);
    let trans = "";
    if (data.type == "dungeon") {
        trans = `entrance.${name}`;
    } else {
        trans = `entrance.${area}.${name}`;
    }
    let record = Object.assign({}, ENTRANCE_STRUCT);
    record.access = `logic.${trans}`;
    record.type = data.type;

    if (world.entrances.hasOwnProperty(trans)) {
        console.error(`name duplication: ${trans}`);
    }
    world.entrances[trans] = record;
    world.areas[area_name].entrances.push(trans);

    maps[area_name].entrances.push({
        "type": "entrance",
        "id": trans,
        "x": 0,
        "y": 0
    });
}

for (let i in locations) {
    let trans = translateValue(i);
    let data = locations[i];

    world.areas[trans] = {
        "type": locations[i].type,
        "locations": [],
        "entrances": []
    };
    locationlists[trans] = [];
    maps[trans] = {
        "background": "",
        "locations": [],
        "entrances": []
    };
    if (!!locations[i].hasmq) {
        let trans_mq = translateValue(`${i}_mq`);
        world.areas[trans_mq] = {
            "type": locations[i].type,
            "locations": [],
            "entrances": []
        };
        locationlists[trans_mq] = [];
        maps[trans_mq] = {
            "background": "",
            "locations": [],
            "entrances": []
        };
        
        if (!!data.x && !!data.y) {
            maps[""].locations.push({
                "type": "entrance",
                "id": `entrance.${trans.replace("area.", "")}`,
                "x": Math.round(19.2 * parseFloat(data.x)),
                "y": Math.round(10.8 * parseFloat(data.y))
            });
        }
        locationlists[""].push({
            "type": "entrance",
            "id": `entrance.${trans.replace("area.", "")}`
        });
    } else {
        if (!!data.x && !!data.y) {
            maps[""].locations.push({
                "type": "area",
                "id": trans,
                "x": Math.round(19.2 * parseFloat(data.x)),
                "y": Math.round(10.8 * parseFloat(data.y))
            });
        }
        locationlists[""].push({
            "type": "area",
            "id": trans
        });
    }

    if (locations[i].hasOwnProperty("chests_v")) {
        for (let k in locations[i].chests_v) {
            convert_locations(i, k, "chests", locations[i].chests_v[k]);
        }
    }
    if (locations[i].hasOwnProperty("chests_mq")) {
        for (let k in locations[i].chests_mq) {
            convert_locations(`${i}_mq`, k, "chests", locations[i].chests_mq[k]);
        }
    }
    if (locations[i].hasOwnProperty("skulltulas_v")) {
        for (let k in locations[i].skulltulas_v) {
            convert_locations(i, k, "skulltulas", locations[i].skulltulas_v[k]);
        }
    }
    if (locations[i].hasOwnProperty("skulltulas_mq")) {
        for (let k in locations[i].skulltulas_mq) {
            convert_locations(`${i}_mq`, k, "skulltulas", locations[i].skulltulas_mq[k]);
        }
    }
    if (locations[i].hasOwnProperty("gossipstones_v")) {
        for (let k in locations[i].gossipstones_v) {
            convert_locations(i, k, "gossipstones", locations[i].gossipstones_v[k]);
        }
    }
    if (locations[i].hasOwnProperty("entrances")) {
        for (let k in locations[i].entrances) {
            convert_entrance(i, k, locations[i].entrances[k]);
        }
    }
}

for (let i in items) {
    let trans = translateValue(`items.${i}`);
    citems[trans] = items[i];
    if (!!citems[trans].start_settings) {
        citems[trans].start_settings = translateValue(citems[trans].start_settings);
    }
}

for (let i in settings.options) {
    if (settings.options[i].type == "list") {
        csettings.options[i] = {
            "type": "list",
            "values": settings.options[i].values.map(n=>`options.${n}`).map(translateValue),
            "default": settings.options[i].default.map(n=>`options.${n}`).map(translateValue)
        };
    } else {
        let trans = translateValue(`options.${i}`);
        csettings.options[trans] = settings.options[i];
    }
}
for (let i in settings.skips) {
    if (settings.skips[i].type == "list") {
        csettings.skips[i] = {
            "type": "list",
            "values": settings.skips[i].values.map(n=>`skips.${n}`).map(translateValue),
            "default": settings.skips[i].default.map(n=>`skips.${n}`).map(translateValue)
        };
    } else {
        let trans = translateValue(`skips.${i}`);
        csettings.skips[trans] = settings.skips[i];
    }
}

for (let i in shops) {
    let trans = translateValue(`shops.${i}`);
    cshops[trans] = shops[i];
}

for (let i in songs) {
    let trans = translateValue(`songs.${i}`);
    csongs[trans] = songs[i];
}

const CUSTOM_LOGIC_TYPES = [
    "chest",
    "item",
    "skip",
    "option",
    "skulltula"
];
function recursive_logic_translation(tree) {
    if (CUSTOM_LOGIC_TYPES.indexOf(tree.type) > 0) {
        if (!!tree.value) {
            return {
                type: "value",
                el: translateValue(`${tree.type}s.${tree.el}`),
                value: tree.value,
                category: tree.type
            };
        } else {
            return {
                type: "number",
                el: translateValue(`${tree.type}s.${tree.el}`),
                category: tree.type
            };
        }
    } else if (tree.type == "filter") {
        if (!!tree.value) {
            return {
                type: "value",
                el: `filter.${tree.el.replace(/^filter_/, "")}`,
                value: tree.value,
                category: "filter"
            };
        } else {
            return {
                type: "number",
                el: `filter.${tree.el.replace(/^filter_/, "")}`,
                category: "filter"
            };
        }
    } else if (tree.type == "mixin") {
        return {
            type: "number",
            el: `mixin.${tree.el}`,
            category: "mixin"
        };
    } else {
        if (tree.type == "not") {
            return {
                type: tree.type,
                el: recursive_logic_translation(tree.el)
            };
        } else if (tree.type == "min" || tree.type == "max") {
            return {
                type: tree.type,
                el: recursive_logic_translation(tree.el),
                value: parseInt(tree.value)||0
            };
        } else if (tree.type == "false" || tree.type == "true") {
            return {
                type: tree.type
            };
        } else {
            return {
                type: tree.type,
                el: tree.el.map(recursive_logic_translation)
            };
        }
    }
}

for (let i in logic.chests) {
    clogic[`logic.${translateValue(`chests.${i}`)}`] = recursive_logic_translation(logic.chests[i]);
}
for (let i in logic.skulltulas) {
    clogic[`logic.${translateValue(`skulltulas.${i}`)}`] = recursive_logic_translation(logic.skulltulas[i]);
}
for (let i in logic.gossipstones) {
    clogic[`logic.${translateValue(`gossipstones.${i}`)}`] = recursive_logic_translation(logic.gossipstones[i]);
}
for (let i in logic.mixins) {
    clogic[`mixin.${i}`] = recursive_logic_translation(logic.mixins[i]);
}

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const COMMENT = /^(?:!|#).*$/;

function translate_language(input) {
    let lines = input.split(LNBR_SEQ);
    for(let i = 0; i < lines.length; ++i) {
        let line = lines[i];
        if(!line.length || COMMENT.test(line)) {
            continue;
        }
        let data = line.split("=");
        if(!!data) {
            let key = data[0].trim();
            let value = data[1].trim();
            let trans = translateValue([
                key,
                `chests.${key}`,
                `skulltulas.${key}`,
                `gossipstones.${key}`,
                `skips.${key}`,
                `options.${key}`,
                `items.${key}`
            ]) ||  key;
            lines[i] = `${trans}=${value}`;
        }
    }
    return lines.join("\n");
}

clang_en = translate_language(lang_en);
clang_en2 = translate_language(lang_en2);
clang_de = translate_language(lang_de);

fs.writeFileSync("./src/database/world.json", JSON.stringify(world, null, 4));
fs.writeFileSync("./src/database/maps.json", JSON.stringify(maps, null, 4));
fs.writeFileSync("./src/database/locationlists.json", JSON.stringify(locationlists, null, 4));
fs.writeFileSync("./src/database/items.json", JSON.stringify(citems, null, 4));
fs.writeFileSync("./src/database/settings.json", JSON.stringify(csettings, null, 4));
fs.writeFileSync("./src/database/shops.json", JSON.stringify(cshops, null, 4));
fs.writeFileSync("./src/database/songs.json", JSON.stringify(csongs, null, 4));
fs.writeFileSync("./src/database/logic.json", JSON.stringify(clogic, null, 4));

fs.writeFileSync("./src/i18n/en_us.lang", clang_en);
fs.writeFileSync("./src/i18n/en_us.easy.lang", clang_en2);
fs.writeFileSync("./src/i18n/de_de.lang", clang_de);

fs.writeFileSync("./src/script/storage/converters/StateConverter1.js", `const translation = ${JSON.stringify(translation, null, 4)};

export default function(state) {
    let res = {
        data: {},
        autosave: state.autosave,
        timestamp: state.timestamp,
        version: 2,
        name: state.name
    };
    for (let i of Object.keys(state.data)) {
        res.data[translation[i]||i] = state.data[i];
    }
    return res;
};`);
