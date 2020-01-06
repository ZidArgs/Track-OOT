const fs = require('fs');

const JSON_FILES = [
    "database/items.json",
    "database/grids.json",
    "database/layouts.json",
    "database/songs.json",
    "database/hints.json",
    "database/logic.json",
    "database/settings.json",
    "database/filter.json",
    "database/shops.json",
    "database/shop_items.json"
];
const PROPERTY_FILES = [
    "i18n/de_de.lang",
    "i18n/en_us.lang",
    "i18n/en_us.easy.lang"
];

let translation = {};

let locations = JSON.parse(fs.readFileSync("./_old/buffer/locations.json"));
let items = JSON.parse(fs.readFileSync("./_old/database/items.json"));
let settings = JSON.parse(fs.readFileSync("./_old/database/settings.json"));
let shops = JSON.parse(fs.readFileSync("./_old/database/shops.json"));
let songs = JSON.parse(fs.readFileSync("./_old/database/songs.json"));

function convert_locations(old, area, name, type) {
    translation[`${type}.${name}`] = `location.${area}.${name.replace(`${old}_`, "")}`;
}

for (let i in locations) {
    let name = i;
    if (i == "gerudo_training") {
        name = "training_grounds";
    } else {
    }
    translation[i] = `area.${name}`;
    if (locations[i].hasOwnProperty("chests_v")) {
        for (let k in locations[i].chests_v) {
            convert_locations(i, name, k, "chests");
        }
    }
    if (locations[i].hasOwnProperty("chests_mq")) {
        translation[`${i}_mq`] = `area.${i}_mq`;
        for (let k in locations[i].chests_mq) {
            convert_locations(`${i}_mq`, `${name}_mq`, k, "chests");
        }
    }
    if (locations[i].hasOwnProperty("skulltulas_v")) {
        for (let k in locations[i].skulltulas_v) {
            convert_locations(i, name, k, "skulltulas");
        }
    }
    if (locations[i].hasOwnProperty("skulltulas_mq")) {
        translation[`${i}_mq`] = `area.${i}_mq`;
        for (let k in locations[i].skulltulas_mq) {
            convert_locations(`${i}_mq`, `${name}_mq`, k, "skulltulas");
        }
    }
    if (locations[i].hasOwnProperty("gossipstones_v")) {
        for (let k in locations[i].gossipstones_v) {
            convert_locations(i, name, k, "gossipstones");
        }
    }
}

for (let i in items) {
    translation[`items.${i}`] = `item.${i}`;
}

for (let i in settings.options) {
    if (settings.options[i].type == "list") {
        for (let j of settings.options[i].values) {
            translation[`options.${j}`] = `option.${j}`;
        }
    } else {
        translation[`options.${i}`] = `option.${i}`;
    }
}
for (let i in settings.skips) {
    if (settings.skips[i].type == "list") {
        for (let j of settings.skips[i].values) {
            translation[`skips.${j}`] = `skip.${j}`;
        }
    } else {
        translation[`skips.${i}`] = `skip.${i}`;
    }
}

for (let i in shops) {
    translation[`shops.${i}`] = `shop.${i.replace(/^shop_/, "")}`;
}

for (let i in songs) {
    translation[`songs.${i}`] = `song.${i.replace(/^song_/, "")}`;
}

fs.writeFileSync("./_old/buffer/translation.json", JSON.stringify(translation, null, 4));
