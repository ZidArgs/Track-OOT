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
        #text[data-state="opened"] {
            color: var(--location-status-opened-color, #000000);
        }
        #text[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #text[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        #text[data-state="possible"] {
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

const TPL_MNU_CTX = new Template(`
    <emc-contextmenu id="menu">
        <div id="menu-check" class="item">Check All</div>
        <div id="menu-uncheck" class="item">Uncheck All</div>
        <div class="splitter"></div>
        <div id="menu-associate" class="item">Set Entrance</div>
    </emc-contextmenu>
`);

const TPL_MNU_EXT = new Template(`
    <style>
        #select {
            height: 300px;
            width: 300px;
        }
    </style>
    <emc-contextmenu id="menu">
        <emc-listselect id="select"></emc-listselect>
    </emc-contextmenu>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

const ACTIVE = new WeakMap();
const EXIT = new WeakMap();
const AREA = new WeakMap();
const ACCESS = new WeakMap();
const MNU_CTX = new WeakMap();
const MNU_EXT = new WeakMap();

export default class ListExit extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        ACTIVE.set(this, []);
        EXIT.set(this, "");
        AREA.set(this, "");
        ACCESS.set(this, "");
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* context menu */
        let mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        let mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);

        let mnu_ext = document.createElement("div");
        mnu_ext.attachShadow({mode: 'open'});
        mnu_ext.shadowRoot.append(TPL_MNU_EXT.generate());
        let selectEl = mnu_ext.shadowRoot.getElementById("select");
        let mnu_ext_el = mnu_ext.shadowRoot.getElementById("menu");
        MNU_EXT.set(this, mnu_ext);

        selectEl.addEventListener("change", event => {
            let exit = EXIT.get(this);
            if (exit != "") {
                StateStorage.writeExtra("exits", exit, event.value);
            }
        });
        selectEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            let area = AREA.get(this);
            let data = FileData.get(`world_lists/${area}/lists`);
            if (data.v != null) {
                for (let loc of data.v) {
                    StateStorage.write(loc.id, true);
                }
            }
            if (data.mq != null) {
                for (let loc of data.mq) {
                    StateStorage.write(loc.id, true);
                }
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            let area = AREA.get(this);
            let data = FileData.get(`world_lists/${area}/lists`);
            if (data.v != null) {
                for (let loc of data.v) {
                    StateStorage.write(loc.id, false);
                }
            }
            if (data.mq != null) {
                for (let loc of data.mq) {
                    StateStorage.write(loc.id, false);
                }
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-associate").addEventListener("click", event => {
            mnu_ext_el.show(mnu_ctx_el.left, mnu_ctx_el.top);
            event.preventDefault();
            return false;
        });

        /* mouse events */
        this.addEventListener("click", event => {
            let area = AREA.get(this);
            if (!!area) {
                this.triggerGlobal("location_change", {
                    name: area
                });
            }
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx_el.show(event.clientX, event.clientY);
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal("state", event => {
            let exit = EXIT.get(this);
            let active = ACTIVE.get(this);
            if (event.data.state.hasOwnProperty("option.entrance_shuffle")) {
                selectEl.readonly = active.indexOf(event.data.state["option.entrance_shuffle"]) < 0;
            }
            if (event.data.extra.exits != null && event.data.extra.exits[exit] != null) {
                this.value = event.data.extra.exits[exit];
            } else {
                let data = FileData.get(`exits/${exit}`);
                this.value = data.target;
            }
        });
        this.registerGlobal("randomizer_options", event => {
            let active = ACTIVE.get(this);
            if (event.data.hasOwnProperty("option.entrance_shuffle")) {
                selectEl.readonly = active.indexOf(event.data["option.entrance_shuffle"]) < 0;
            }
            this.update();
        });
        this.registerGlobal("statechange_exits", event => {
            let exit = EXIT.get(this);
            let data;
            if (event.data != null) {
                data = event.data[exit];
            }
            if (data != null) {
                this.value = data.newValue;
                selectEl.value = data.newValue;
            }
        });
        this.registerGlobal(["settings", "logic", "filter"], event => {
            this.update();
        });
        this.registerGlobal("exit", event => {
            if (this.ref === event.data.name && this.value !== event.data.value) {
                this.value = event.data.value;
            }
        });
    }

    connectedCallback() {
        super.connectedCallback();
        let el = this.parentElement;
        if (el != null) {
            el = el.parentElement;
            if (el != null) {
                el.append(MNU_CTX.get(this));
                el.append(MNU_EXT.get(this));
            }
        }
        // update state
        this.update();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
        MNU_EXT.get(this).remove();
    }

    async update() {
        let area = AREA.get(this);
        if (!!area) {
            let dType = StateStorage.read(`dungeonTypes.${area}`, 'v');
            if (dType == "n") {
                let data_v = FileData.get(`world_lists/${area}/lists/v`);
                let data_m = FileData.get(`world_lists/${area}/lists/mq`);
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[Math.min(res_v.value, res_m.value)];
                } else {
                    this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[Math.max(res_v.value, res_m.value)];
                }
            } else {
                let data = FileData.get(`world_lists/${area}/lists/${dType}`);
                let res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[res.value];
            }
        } else {
            let access = ACCESS.get(this);
            if (!!access && !!Logic.getValue(access)) {
                this.shadowRoot.getElementById("text").dataset.state = "available";
            } else {
                this.shadowRoot.getElementById("text").dataset.state = "unavailable";
            }
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

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let data = FileData.get(`world/${newValue}`);
                    let exit = FileData.get(`exits/${data.access}`);
                    let entrances = FileData.get("entrances");
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(data.access);
                    txt.setAttribute('i18n-content', data.access);
                    ACTIVE.set(this, exit.active);
                    EXIT.set(this, data.access);
                    AREA.set(this, entrances[exit.target].area);
                    ACCESS.set(this, data.access.split(" => ")[1]);
                    this.value = StateStorage.readExtra("exits", data.access, exit.target);
                    // options
                    let selectEl = MNU_EXT.get(this).shadowRoot.getElementById("select");
                    selectEl.value = this.value;
                    for (let key in entrances) {
                        let value = entrances[key];
                        if (value.type == exit.type) {
                            let opt = document.createElement('emc-option');
                            opt.value = key;
                            opt.innerHTML = Language.translate(key);
                            opt.setAttribute('i18n-content', key);
                            selectEl.append(opt);
                        }
                    }
                    // update state
                    this.update();
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let el = this.shadowRoot.getElementById("value");
                    if (!!newValue) {
                        let entrance = FileData.get(`entrances/${newValue}`);
                        el.innerHTML = Language.translate(newValue);
                        AREA.set(this, entrance.area);
                    } else {
                        el.innerHTML = "";
                        AREA.set(this, "");
                    }
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

customElements.define('ootrt-list-exit', ListExit);