import GlobalData from "/deepJS/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import "/deepJS/ui/selection/Option.js";
import TrackerLocalState from "/script/util/LocalState.js";

const EVENT_LISTENERS = new WeakMap();
const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            width: 40px;
            height: 40px;
            cursor: pointer;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
        }
        #value {
            width: 100%;
            height: 100%;
            display: inline-flex;
            align-items: flex-end;
            justify-content: flex-end;
            width: 100%;
            height: 100%;
            color: white;
            font-size: 0.8em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: 0;
            white-space: normal;
            padding: 0;
            line-height: 0.7em;
            font-weight: bold;
        }
    </style>
    <div id="value"></div>
`);
    
function stateChanged(event) {
    EventBus.mute("item");
    // savesatate
    let value = parseInt(event.data.items[this.ref]);
    if (typeof value == "undefined" || isNaN(value)) {
        value = 0;
    }
    this.value = value;
    EventBus.unmute("item");
}

function itemUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        EventBus.mute("item");
        let value = parseInt(event.data.value);
        if (typeof value == "undefined" || isNaN(value)) {
            value = 0;
        }
        this.value = value;
        EventBus.unmute("item");
    }
}

function dungeonTypeUpdate(event) {
    let data = GlobalData.get("items")[this.ref];
    if (data.hasOwnProperty("maxmq") && data.hasOwnProperty("related_dungeon") && event.data.name === data.related_dungeon) {
        this.fillItemChoices();
    }
}

class HTMLTrackerInfiniteItem extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.prev);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        let events = new Map();
        events.set("item", itemUpdate.bind(this));
        events.set("state", stateChanged.bind(this));
        events.set("dungeontype", dungeonTypeUpdate.bind(this));
        EVENT_LISTENERS.set(this, events);
    }

    connectedCallback() {
        if (!this.value) {
            let all = this.querySelectorAll("[value]");
            if (!!all.length) {
                this.value = all[0].value;
            }
        }
        /* event bus */
        EVENT_LISTENERS.get(this).forEach(function(value, key) {
            EventBus.register(key, value);
        });
    }

    disconnectedCallback() {
        /* event bus */
        EVENT_LISTENERS.get(this).forEach(function(value, key) {
            EventBus.unregister(key, value);
        });
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

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    let data = GlobalData.get("items")[newValue];
                    this.style.backgroundImage = `url("/images/${data.images}"`;
                    EventBus.mute("item");
                    this.value = TrackerLocalState.read("items", this.ref, 0);
                    EventBus.unmute("item");
                break;
                case 'value':
                    this.shadowRoot.getElementById("value").innerHTML = newValue;
                    TrackerLocalState.write("items", this.ref, parseInt(newValue));
                    EventBus.trigger("item", {
                        name: this.ref,
                        value: newValue
                    });
                break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            let val = parseInt(this.value);
            if (val < 9999) this.value = val + 1;
            else this.value = 9999;
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            if ((event.shiftKey || event.ctrlKey)) {
                this.value = 0;
            } else {
                let val = parseInt(this.value);
                if (val > 0) this.value = val - 1;
                else this.value = 0;
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-infiniteitem', HTMLTrackerInfiniteItem);