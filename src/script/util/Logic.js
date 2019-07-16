import GlobalData from "/deepJS/storage/GlobalData.js";
import MemoryStorage from "/deepJS/storage/MemoryStorage.js";
import {svg2png} from "/deepJS/util/Helper.js";
import DeepLocalStorage from "/deepJS/storage/LocalStorage.js";
import TrackerLocalState from "/script/util/LocalState.js";
import LogicWrapper from "/script/util/LogicWrapper.js";

const LOGIC = {
    chests: {},
    skulltulas: {},
    gossipstones: {},
    mixins: {}
};

const CATEGORIES = {
    "chests_v": "chests",
    "chests_mq": "chests",
    "skulltulas_v": "skulltulas",
    "skulltulas_mq": "skulltulas",
    "gossipstones_v": "gossipstones"
};

class TrackerLogic {

    getValue(type, ref) {
        if (!!LOGIC[type] && !!LOGIC[type][ref]) {
            return LOGIC[type][ref].value;
        }
        return false;
    }

    checkLogicList(category, name, mode) {
        let list = GlobalData.get("locations")[name];
        if (!!mode) {
            list = GlobalData.get("locations")[name][`${category}_${mode}`];
        } else {
            let dType = TrackerLocalState.read("dungeonTypes", name, list.hasmq ? "n" : "v");
            if (dType === "n") {
                let res_v = this.checkLogicList(category, name, "v");
                let res_m = this.checkLogicList(category, name, "mq");
                if (DeepLocalStorage.get("settings", "unknown_dungeon_need_both", false)) {
                    return Math.min(res_v, res_m) || res_v || res_m;
                } else {
                    return Math.max(res_v, res_m);
                }
            }
            list = GlobalData.get("locations")[name][`${category}_${dType}`];
        }
    
        let canGet = 0;
        let unopened = 0;
        for (let i in list) {
            let filter = MemoryStorage.get("active_filter", "filter_era_active", GlobalData.get("filter")["filter_era_active"].default);
            if (!list[i].era || !filter || filter === list[i].era) {
                if (!list[i].mode || TrackerLocalState.read("options", list[i].mode, false)) {
                    if (!TrackerLocalState.read(category, i, 0)) {
                        unopened++;
                        if (this.getValue(category, i)) {
                            canGet++;
                        }
                    }
                }
            }
        }
        if (unopened == 0)
            return 0b000;
        if (canGet == unopened)
            return 0b100;
        if (canGet == 0)
            return 0b001;
        return 0b010;
    }

    loadLogic() {
        let locations = GlobalData.get("locations");
        for (let loc in locations) {
            for (let cat in CATEGORIES) {
                let category = CATEGORIES[cat];
                let checks = locations[loc][cat];
                if (!!checks) {
                    for (let check in checks) {
                        LOGIC[category][check] = new LogicWrapper(category, check);
                    }
                }
            }
        }
        for (let i in GlobalData.get("logic").mixins) {
            LOGIC["mixins"][i] = new LogicWrapper("mixins", i);
        }
        for (let i in GlobalData.get("logic_patched").mixins) {
            if (!!LOGIC["mixins"][i]) continue;
            LOGIC["mixins"][i] = new LogicWrapper("mixins", i);
        }
    }

    updateLogic() {
        for (let i in LOGIC) {
            for (let j in LOGIC[i]) {
                LOGIC[i][j].loadLogic();
            }
        }
    }

    getLogicSVG(type, ref) {
        return LOGIC[type][ref].buildSVG();
    }

    getLogicView(type, ref) {
        let el = document.createElement("div");
        let b = document.createElement("button");
        b.innerHTML = "PNG";
        b.dataset.type = type;
        b.dataset.ref = ref;
        b.addEventListener("click", async function(e) {
            let t = e.target;
            let svg = this.getLogicSVG(t.dataset.type, t.dataset.ref);
            let png = await svg2png(svg);
            let svg_win = window.open("", "_blank", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no");
            let img = document.createElement("img");
            img.src = png;
            svg_win.document.body.append(img);
        }.bind(this));
        el.append(b);
        el.append(LOGIC[type][ref].getLogic());
        return el;
    }

}

export default new TrackerLogic;