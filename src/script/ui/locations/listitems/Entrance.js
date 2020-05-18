import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Dialog from "/emcJS/ui/Dialog.js";
import "/emcJS/ui/ContextMenu.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import ListLogic from "/script/util/ListLogic.js";
import Logic from "/script/util/Logic.js";
import Language from "/script/util/Language.js";

const SettingsStorage = new IDBStorage('settings');

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            cursor: pointer;
            padding: 5px;
        }
        :host(:hover) {
            background-color: var(--main-hover-color, #ffffff32);
        }
        .textarea {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            min-height: 35px;
            word-break: break-word;
        }
        .textarea:empty {
            display: none;
        }
        #text {
            display: flex;
            flex: 1;
            color: #ffffff;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
        }
        #text[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #text[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        :host([value]:not([value=""])) #text {
            color: var(--location-status-opened-color, #000000);
        }
        #value[data-state="opened"] {
            color: var(--location-status-opened-color, #000000);
        }
        #value[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #value[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        #value[data-state="possible"] {
            color: var(--location-status-possible-color, #000000);
        }
        #badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            flex-shrink: 0;
            margin-left: 5px;
            border: 1px solid var(--navigation-background-color, #ffffff);
            border-radius: 2px;
        }
        #badge emc-icon {
            width: 25px;
            height: 25px;
        }
        .menu-tip {
            font-size: 0.7em;
            color: #777777;
            margin-left: 15px;
            float: right;
        }
    </style>
    <div class="textarea">
        <div id="text"></div>
        <div id="badge">
            <emc-icon src="images/icons/entrance.svg"></emc-icon>
            <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
            <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
        </div>
    </div>
    <div id="value" class="textarea">
    </div>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

export default class ListEntrance extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* mouse events */
        this.addEventListener("click", event => {
            if (!!this.value) {
                this.triggerGlobal("location_change", {
                    name: this.value
                });
            } else {
                entranceDialog(this.ref).then(area => {
                    if (this.value != area) {
                        let logic = {};
                        if (!!area) {
                            let ref = FileData.get(`world/${area}/access`);
                            logic[ref] = {
                                "type": "value",
                                "el": this.access,
                                "category": "entrance"
                            }
                        } else {
                            let ref = FileData.get(`world/${this.value}/access`);
                            logic[ref] = null;
                        }
                        //Logic.setLogic(logic);
                        this.value = area;
                        this.triggerGlobal("entrance", {
                            name: this.ref,
                            value: area
                        });
                    }
                });
            }
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.value = "";
            StateStorage.write(this.ref, "");
            this.triggerGlobal("entrance", {
                name: this.ref,
                value: ""
            });
            event.preventDefault();
            return false;
        });
        /* event bus */
        this.registerGlobal("state", event => {
            let value = event.data[this.ref];
            if (typeof value == "undefined") {
                value = "";
            }
            this.value = value;
        });
        this.registerGlobal(["settings", "randomizer_options", "logic", "filter"], event => {
            this.update()
        });
        this.registerGlobal("entrance", event => {
            if (this.ref === event.data.name && this.value !== event.data.value) {
                this.value = event.data.value;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.update();
    }

    async update() {
        if (!!this.value) {
            let dType = StateStorage.read(`dungeonTypes.${this.value}`, 'v');
            if (dType == "n") {
                let data_v = FileData.get(`world_lists/${this.value}/lists/v`);
                let data_m = FileData.get(`world_lists/${this.value}/lists/mq`);
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    this.shadowRoot.getElementById("value").dataset.state = VALUE_STATES[Math.min(res_v.value, res_m.value)];
                } else {
                    this.shadowRoot.getElementById("value").dataset.state = VALUE_STATES[Math.max(res_v.value, res_m.value)];
                }
            } else {
                let data = FileData.get(`world_lists/${this.value}/lists/${dType}`);
                let res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("value").dataset.state = VALUE_STATES[res.value];
            }
        } else if (!!this.access && !!Logic.getValue(this.access)) {
            this.shadowRoot.getElementById("text").dataset.state = "available";
        } else {
            this.shadowRoot.getElementById("text").dataset.state = "unavailable";
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get access() {
        return this.getAttribute('access');
    }

    set access(val) {
        this.setAttribute('access', val);
    }

    static get observedAttributes() {
        return ['ref', 'value', 'access'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(newValue);
                    this.value = StateStorage.read(newValue, "");
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    if (!!newValue) {
                        this.shadowRoot.getElementById("value").innerHTML = Language.translate(newValue);
                    } else {
                        this.shadowRoot.getElementById("value").innerHTML = "";
                    }
                    this.update();
                }
            break;
            case 'access':
                if (oldValue != newValue) {
                    this.update();
                }
            break;
        }
    }

    setFilterData(data) {
        let el_era = this.shadowRoot.getElementById("badge-era");
        if (!data["filter.era/child"]) {
            el_era.src = "images/icons/era_adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/icons/era_child.svg";
        } else {
            el_era.src = "images/icons/era_both.svg";
        }
        let el_time = this.shadowRoot.getElementById("badge-time");
        if (!data["filter.time/day"]) {
            el_time.src = "images/icons/time_night.svg";
        } else if (!data["filter.time/night"]) {
            el_time.src = "images/icons/time_day.svg";
        } else {
            el_time.src = "images/icons/time_always.svg";
        }
    }

}

customElements.define('ootrt-list-entrance', ListEntrance);

function entranceDialog(ref) {
    return new Promise(resolve => {
        let value = StateStorage.read(ref, "");
        let world = FileData.get('world');
        let type = world[ref].type;
    
        let loc = document.createElement('label');
        loc.style.display = "flex";
        loc.style.justifyContent = "space-between";
        loc.style.alignItems = "center";
        loc.style.padding = "5px";
        loc.innerHTML = Language.translate("location");
        let slt = document.createElement("select");

        let unbound = new Set();
        for (let i in world) {
            let entry = world[i];
            if (entry.category == "area" && entry.type == type) {
                unbound.add(i);
            }
        }
        for (let i in world) {
            let entry = world[i];
            if (entry.category == "entrance" && entry.type == type) {
                let bound = StateStorage.read(i, "");
                if (i != ref && !!bound) {
                    unbound.delete(bound);
                }
            }
        }
        unbound = Array.from(unbound);
        
        for (let i of unbound) {
            slt.append(createOption(i, Language.translate(i)));
        }
        slt.style.width = "200px";
        slt.value = value;
        loc.append(slt);
        
        let d = new Dialog({title: Language.translate(ref), submit: true, cancel: true});
        d.onsubmit = function(ref, result) {
            if (!!result) {
                let res = slt.value;
                StateStorage.write(ref, res);
                resolve(res);
            } else {
                resolve(false);
            }
        }.bind(this, ref);
        d.append(loc);
        d.show();
    });
}

function createOption(value, content) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = content;
    return opt;
}