import GlobalData from "/deepJS/storage/GlobalData.js";
import MemoryStorage from "/deepJS/storage/MemoryStorage.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import TrackerLocalState from "/script/util/LocalState.js";
import Logic from "/script/util/Logic.js";
import I18n from "/script/util/I18n.js";

const TPL = new Template(`
    <style>
        :host {
            position: absolute;
            display: inline-flex;
            width: 24px;
            height: 24px;
            box-sizing: border-box;
            transform: translate(-12px, -12px);
        }
        :host(:hover) {
            z-index: 1000;
        }
        #marker {
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            border: solid 2px black;
            border-radius: 25%;
            color: black;
            font-size: 0.8em;
            cursor: pointer;
        }
        .opened {
            background-color: var(--location-status-opened-color, #000000);
        }
        .available {
            background-color: var(--location-status-available-color, #000000);
        }
        .unavailable {
            background-color: var(--location-status-unavailable-color, #000000);
        }
        .possible {
            background-color: var(--location-status-possible-color, #000000);
        }
        #marker:hover {
            box-shadow: 0 0 2px 4px #67ffea;
        }
        #marker:hover + #tooltip {
            display: block;
        }
        #tooltip {
            padding: 10px;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
        }
    </style>
    <div id="marker" class="unavailable"></div>
    <deep-tooltip position="top" id="tooltip"></deep-tooltip>
`);

function translate(value) {
    switch (value) {
        case 0b100: return "available";
        case 0b010: return "possible";
        case 0b001: return "unavailable";
        default: return "opened";
    }
}

function canGet(name, category) {
    let list = GlobalData.get("locations")[name];
    let dType = TrackerLocalState.read("dungeonTypes", name, list.hasmq ? "n" : "v");
    if (dType === "n") {
        return "";
    }
    list = GlobalData.get("locations")[name][`${category}_${dType}`];
    let canGet = 0;
    for (let i in list) {
        let filter = MemoryStorage.get("active_filter", "filter_era_active", GlobalData.get("filter")["filter_era_active"].default);
        if (!list[i].era || !filter || filter === list[i].era) {
            if (!list[i].mode || TrackerLocalState.read("options", list[i].mode, false)) {
                if (!TrackerLocalState.read(category, i, 0)) {
                    if (Logic.getValue(category, i)) {
                        canGet++;
                    }
                }
            }
        }
    }
    return canGet;
}

function locationUpdate(event) {
    if (this.ref === event.data.name.split('.')[0]) {
        this.attributeChangedCallback("", "");
    }
}

function itemUpdate(event) {
    this.attributeChangedCallback("", "");
}

function dungeonTypeUpdate(event) {
    if (this.ref === event.data.ref) {
        this.attributeChangedCallback("", "");
    }
}

class HTMLTrackerPOIArea extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", () => EventBus.trigger("location-change", {
            name: this.ref
        }));
        EventBus.register(["dungeon-type-update","net:dungeon-type-update"], dungeonTypeUpdate.bind(this));
        EventBus.register(["location-update", "net:location-update"], locationUpdate.bind(this));
        EventBus.register(["item-update", "net:item-update"], itemUpdate.bind(this));
        EventBus.register("location-era-change", itemUpdate.bind(this));
        EventBus.register("force-location-update", itemUpdate.bind(this));
        EventBus.register("location-mode-change", event => {
            this.mode = event.data.value;
        });
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get mode() {
        return this.getAttribute('mode');
    }

    set mode(val) {
        this.setAttribute('mode', val);
    }

    static get observedAttributes() {
        return ['ref', 'mode'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            let val = Logic.checkLogicList(this.mode, this.ref);
            this.shadowRoot.getElementById("marker").className = translate(val);
            if (val > 0b001) {
                this.shadowRoot.getElementById("marker").innerHTML = canGet(this.ref, this.mode);
            } else {
                this.shadowRoot.getElementById("marker").innerHTML = "";
            }
            if (name == "ref") {
                let tooltip = this.shadowRoot.getElementById("tooltip");
                tooltip.innerHTML = I18n.translate(this.ref);
                let left = parseFloat(this.style.left.slice(0, -1));
                let top = parseFloat(this.style.top.slice(0, -1));
                if (left < 30) {
                    if (top < 30) {
                        tooltip.position = "bottomright";
                    } else if (top > 70) {
                        tooltip.position = "topright";
                    } else {
                        tooltip.position = "right";
                    }
                } else if (left > 70) {
                    if (top < 30) {
                        tooltip.position = "bottomleft";
                    } else if (top > 70) {
                        tooltip.position = "topleft";
                    } else {
                        tooltip.position = "left";
                    }
                } else {
                    if (top < 30) {
                        tooltip.position = "bottom";
                    } 
                }
            }
        }
    }

}

customElements.define('ootrt-poiarea', HTMLTrackerPOIArea);