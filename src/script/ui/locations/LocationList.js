import GlobalData from "/script/storage/GlobalData.js";
import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/ui/selection/SwitchButton.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import I18n from "/script/util/I18n.js";
import Logic from "/script/util/Logic.js";
import Areas from "/script/util/world/Areas.js";
import Entrances from "/script/util/world/Entrances.js";
import Locations from "/script/util/world/Locations.js";
import World from "/script/util/World.js";
import "./listitems/Area.js";
import "./listitems/Entrance.js";
import "./listitems/Chest.js";
import "./listitems/Skulltula.js";
import "./listitems/Gossipstone.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            flex-direction: column;
            min-width: 100%;
            min-height: 100%;
            width: 300px;
            height: 300px;
        }
        #title {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 10px;
            font-size: 1.5em;
            line-height: 1em;
            border-bottom: solid 1px white;
        }
        #title-text {
            display: flex;
            flex: 1;
            justify-content: flex-start;
            align-items: center;
        }
        #title > emc-switchbutton {
            width: 38px;
            height: 38px;
            padding: 4px;
            margin-left: 8px;
            border: solid 2px var(--navigation-background-color, #ffffff);
            border-radius: 10px;
        }
        #body {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .opened {
            color: var(--location-status-opened-color, #000000);
        }
        .available {
            color: var(--location-status-available-color, #000000);
        }
        .unavailable {
            color: var(--location-status-unavailable-color, #000000);
        }
        .possible {
            color: var(--location-status-possible-color, #000000);
        }
        #list {
            display: content;
        }
        #back,
        #list > * {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            min-height: 30px;
            width: 100%;
            padding: 2px;
            line-height: 1em;
            cursor: pointer;
        }
        #back:hover,
        #list > *:hover {
            background-color: var(--dungeon-status-hover-color, #ffffff32);
        }
        :host(:not([ref])) #back,
        :host([ref=""]) #back {
            display: none;
        }
    </style>
    <div id="title">
        <div id="title-text">${I18n.translate("hyrule")}</div>
        <emc-switchbutton value="v" id="location-version" readonly="true">
            <emc-option value="n" style="background-image: url('images/dungeontype/undefined.svg')"></emc-option>
            <emc-option value="v" style="background-image: url('images/dungeontype/vanilla.svg')"></emc-option>
            <emc-option value="mq" style="background-image: url('images/dungeontype/masterquest.svg')"></emc-option>
        </emc-switchbutton>
        <emc-switchbutton value="" id="location-era">
            <emc-option value="" style="background-image: url('images/world/era/both.svg')"></emc-option>
            <emc-option value="child" style="background-image: url('images/world/era/child.svg')"></emc-option>
            <emc-option value="adult" style="background-image: url('images/world/era/adult.svg')"></emc-option>
        </emc-switchbutton>
    </div>
    <div id="body">
        <div id="back">(${I18n.translate("back")})</div>
        <div id="list"></div>
    </div>
`);

function translate(value) {
    switch (value) {
        case 0b100: return "available";
        case 0b010: return "possible";
        case 0b001: return "unavailable";
        default: return "opened";
    }
}

async function updateHeader() {
    if ((!this.ref || this.ref === "")) {
        this.shadowRoot.querySelector('#title').className = "";
    } else {
        this.shadowRoot.querySelector('#title').className = translate(await Logic.checkLogicList(this.ref || "overworld"));
    }
}

function dungeonTypeUpdate(event) {
    if (this.ref === event.data.name) {
        this.attributeChangedCallback("", "");
    }
}

class HTMLTrackerLocationList extends Panel {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.attributeChangedCallback("", "");
        this.shadowRoot.getElementById('location-era').addEventListener("change", event => {
            this.era = event.newValue;
            MemoryStorage.set("filter.era_active", this.era);
            EventBus.trigger("filter", {
                ref: "filter.era_active",
                value: this.era
            });
        });
        this.shadowRoot.getElementById('back').addEventListener("click", () => this.ref = "");
        /* event bus */
        EVENT_BINDER.register("location_change", event => this.ref = event.data.name);
        EVENT_BINDER.register(["chest", "skulltula", "item", "state", "settings", "logic"], updateHeader.bind(this));
        EVENT_BINDER.register("dungeontype", dungeonTypeUpdate.bind(this));
        EVENT_BINDER.register("filter", event => {
            if (event.data.ref == "filter.era_active") {
                this.era = event.data.value;
                this.shadowRoot.getElementById('location-era').value = this.era;
            }
        });
    }

    connectedCallback() {
        this.refresh();
    }

    get ref() {
        return this.getAttribute('ref') || "";
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get era() {
        return this.getAttribute('era');
    }

    set era(val) {
        this.setAttribute('era', val);
    }

    static get observedAttributes() {
        return ['ref', 'era'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            if (name == "ref") {
                this.shadowRoot.getElementById("title-text").innerHTML = I18n.translate(newValue || "hyrule");
            }
            this.refresh();
        }
    }

    refresh() {
        let cnt = this.shadowRoot.getElementById("list");
        cnt.innerHTML = "";
        let data = GlobalData.get(`locationlists/${this.ref}`);
        if (!!data) {
            let values = new Map(Object.entries(StateStorage.getAll()));
            data.forEach(record => {
                if (record.type == "area") {
                    let loc = Areas.get(record.id);
                    let el = loc.listItem;
                    cnt.append(el);
                } else if (record.type == "entrance") {
                    let loc = Entrances.get(record.id);
                    if (loc.visible(values) && (!this.era || loc[this.era](values))) {
                        let el = loc.listItem;
                        cnt.append(el);
                    }
                } else {
                    let loc = Locations.get(record.id);
                    if (loc.visible(values) && (!this.era || loc[this.era](values))) {
                        let el = loc.listItem;
                        if (!!el.mode && el.mode.indexOf(this.mode) < 0) return;
                        cnt.append(el);
                    }
                }
            });
            /*
            data.forEach(record => {
                let loc = World.get(record.id);
                if (loc.visible(values) && (!this.era || loc[this.era](values))) {
                    let el = loc.listItem;
                    this.append(el);
                }
            });
            */
        }
        updateHeader.apply(this);
    }
    
}

Panel.registerReference("location-list", HTMLTrackerLocationList);
customElements.define('ootrt-locationlist', HTMLTrackerLocationList);