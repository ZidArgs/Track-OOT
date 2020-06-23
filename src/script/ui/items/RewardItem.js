import FileData from "/emcJS/storage/FileData.js";
import Language from "/script/util/Language.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/selection/Option.js";
import StateStorage from "/script/storage/StateStorage.js";
import { Rewards } from  "/script/ui/dungeonstate/DungeonReward.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
            user-select: none;
        }
        :host {
            display: inline-flex;
            width: 40px;
            height: 40px;
            cursor: pointer;
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: border-box;
        }
        :host(:hover) {
            background-size: 100%;
        }
        :host([value="0"]) {
            filter: contrast(0.8) grayscale(0.5);
            opacity: 0.4;
        }
        #value {
            width: 100%;
            height: 100%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 2px;
            color: white;
            font-size: 0.8em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: 0;
            white-space: normal;
            line-height: 0.7em;
            font-weight: bold;
            -moz-user-select: none;
            user-select: none;
        }
    </style>
    <div id="value">
    </div>
`);

const ALL_DUNGEONS = [
    'pocket',
    'area.deku',
    'area.dodongo',
    'area.jabujabu',
    'area.temple_forest',
    'area.temple_fire',
    'area.temple_shadow',
    'area.temple_water',
    'area.temple_spirit'
];

function getAlign(value) {
    switch (value) {
        case 'start':
            return "flex-start";
        case 'end':
            return "flex-end";
        default:
            return "center";
    }
}
    
function stateChanged(event) {
    let value = parseInt(event.data[this.ref]);
    if (isNaN(value)) {
        value = 0;
    }
    this.value = value;
}

function itemUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        let value = parseInt(event.data.value);
        if (typeof value == "undefined" || isNaN(value)) {
            value = 0;
        }
        this.value = value;
    }
}

function dungeonRewardUpdate(event) {
    this.displayDungeonReward();
}

class HTMLTrackerRewardItem extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.prev);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        this.registerGlobal("item", itemUpdate.bind(this));
        this.registerGlobal("state", stateChanged.bind(this));
        this.registerGlobal("dungeonreward", dungeonRewardUpdate.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.ref != null) {
            this.displayDungeonReward();
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

    get readonly() {
        return this.getAttribute('readonly');
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    get halign() {
        return this.getAttribute('halign');
    }

    set halign(val) {
        this.setAttribute('halign', val);
    }

    get valign() {
        return this.getAttribute('halign');
    }

    set valign(val) {
        this.setAttribute('valign', val);
    }

    static get observedAttributes() {
        return ['ref', 'halign', 'valign'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    let data = FileData.get("items")[newValue];
                    if (data.halign != null) {
                        this.halign = data.halign;
                    }
                    if (data.valign != null) {
                        this.valign = data.valign;
                    }
                    this.style.backgroundImage = `url("${data.images}")`;
                    this.value = StateStorage.read(this.ref, 0);
                    this.displayDungeonReward();
                break;
                case 'halign':
                    this.shadowRoot.getElementById("value").style.justifyContent = getAlign(newValue);
                break;
                case 'valign':
                    this.shadowRoot.getElementById("value").style.alignItems = getAlign(newValue);
                break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            this.value = 1;
            StateStorage.write(this.ref, 1);
            this.triggerGlobal("item", {
                name: this.ref,
                value: 1
            });
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            this.value = 0;
            StateStorage.write(this.ref, 0);
            this.triggerGlobal("item", {
                name: this.ref,
                value: 0
            });
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    displayDungeonReward() {
        let el = this.shadowRoot.getElementById("value");
        el.innerHTML = "";
        const rewardId = Rewards.indexOf(this.ref)
        if (rewardId >= 0) {
            for (let dungeon of ALL_DUNGEONS) {
                let rewardValue = StateStorage.read(`dungeonRewards.${dungeon}`, 0);
                if (rewardValue == rewardId + 1) {
                    el.innerHTML = Language.translate(`${dungeon}.short`);
                }
            }
        }
    }

}

customElements.define('ootrt-rewarditem', HTMLTrackerRewardItem);