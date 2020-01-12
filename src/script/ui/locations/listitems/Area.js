import GlobalData from "/script/storage/GlobalData.js";
import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Logger from "/emcJS/util/Logger.js";
import Helper from "/emcJS/util/Helper.js";
import Dialog from "/emcJS/ui/Dialog.js";
import "/emcJS/ui/ContextMenu.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import Logic from "/script/util/Logic.js";
import I18n from "/script/util/I18n.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            align-items: center;
            width: 100%;
            cursor: pointer;
            padding: 5px;
        }
        :host(:hover) {
            background-color: var(--main-hover-color, #ffffff32);
        }
        #text {
            flex: 1;
            color: #ffffff;
        }
        #text.opened {
            color: var(--location-status-opened-color, #000000);
        }
        #text.available {
            color: var(--location-status-available-color, #000000);
        }
        #text.unavailable {
            color: var(--location-status-unavailable-color, #000000);
        }
        #text.possible {
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
            width: 30px;
            height: 30px;
        }
        .menu-tip {
            font-size: 0.7em;
            color: #777777;
            margin-left: 15px;
            float: right;
        }
    </style>
    <div id="text"></div>
    <div id="badge">
        <emc-icon src="images/world/icons/area.svg"></emc-icon>
        <emc-icon id="badge-time" src="images/world/time/always.svg"></emc-icon>
        <emc-icon id="badge-era" src="images/world/era/both.svg"></emc-icon>
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

export default class HTMLTrackerChest extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.addEventListener("click", () => EventBus.trigger("location_change", {
            name: this.ref
        }));
        /* event bus */
        EVENT_BINDER.register(["state", "settings", "logic"], event => this.update());
    }

    async update() {
        if (!!this.ref) {
            let val = await Logic.checkLogicList(this.ref);
            this.shadowRoot.getElementById("text").className = translate(val);
        } else {
            this.shadowRoot.getElementById("text").className = "unavailable";
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.update();
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(this.ref);
                }
            break;
        }
    }

}

customElements.define('ootrt-list-area', HTMLTrackerChest);