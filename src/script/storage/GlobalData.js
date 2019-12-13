import FileLoader from "/deepJS/util/FileLoader.js";
import DateUtil from "/deepJS/util/DateUtil.js";

const FILES = [
    "items",
    "grids",
    "locations",
    "layouts",
    "songs",
    "hints",
    "logic",
    "settings",
    "filter",
    "shops",
    "shop_items"
];

const STORAGE = {
    "version-dev": true,
    "version-string": "DEV",
    "version-date": "01.01.2019 00:00:00"
};

function setVersion(data) {
    STORAGE["version-dev"] = data.dev;
    if (data.dev) {
        STORAGE["version-string"] = `DEV [${data.commit.slice(0,7)}]`;
    } else {
        STORAGE["version-string"] = data.version;
    }
    STORAGE["version-date"] = DateUtil.convert(new Date(data.date), "D.M.Y h:m:s");
    return data;
}

class GlobalData {

    async init() {
        let loading = [];
        FILES.forEach(file => {
            loading.push(FileLoader.json(`database/${file}.json`).then(function(data) {
                STORAGE[file] = data;
            }));
        });
        loading.push(FileLoader.json("version.json").then(setVersion));
        await Promise.all(loading);
    }

    get(name, def = null) {
        if (!!STORAGE[name]) {
            return STORAGE[name];
        }
        return def;
    }

}

export default new GlobalData;