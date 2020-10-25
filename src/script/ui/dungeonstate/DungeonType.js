import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/input/Option.js";
import StateStorage from "/script/storage/StateStorage.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            cursor: pointer;
        }
        slot {
            width: 100%;
            height: 100%;
        }
        :not([value]),
        [value]:not(.active) {
            display: none !important;
        }
        [value] {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: white;
            font-size: 1em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: 0;
            white-space: normal;
            padding: 0;
            line-height: 0.7em;
        }
    </style>
    <emc-option value="n" style="background-image: url('images/dungeontype/undefined.svg')"></emc-option>
    <emc-option value="v" style="background-image: url('images/dungeontype/vanilla.svg')"></emc-option>
    <emc-option value="mq" style="background-image: url('images/dungeontype/masterquest.svg')"></emc-option>
`);

function stateChanged(event) {
    let value = event.data.extra.dungeontype[this.ref];
    if (typeof value == "undefined" || value == "") {
        value = "v";
        if (!!this.ref) {
            let area = FileData.get(`world/${this.ref}/lists`);
            if (area.hasOwnProperty("mq")) {
                value = "n";
            }
        }
    }
    this.value = value;
}

function dungeonTypeUpdate(event) {
    let data;
    if (event.data != null) {
        data = event.data[this.ref];
    }
    if (data != null) {
        this.value = data.newValue;
    }
}

class HTMLTrackerDungeonType extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.revert);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        this.registerGlobal("state", stateChanged.bind(this));
        this.registerGlobal("statechange_dungeontype", dungeonTypeUpdate.bind(this));
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
        let val = this.getAttribute('readonly');
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let value = "v";
                    let readonly = true;
                    if (!!newValue) {
                        let area = FileData.get(`world/${newValue}/lists`);
                        if (area.hasOwnProperty("mq")) {
                            value = StateStorage.readExtra("dungeontype", newValue, "n");
                            readonly = false;
                        }
                    }
                    this.value = value;
                    this.readonly = readonly;
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let oe = this.shadowRoot.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.shadowRoot.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                }
            break;
        }
    }

    next(event) {
        if (!this.readonly) {
            if (this.value == 'v') {
                this.value = 'mq';
            } else {
                this.value = 'v';
            }
            StateStorage.writeExtra("dungeontype", this.ref, this.value);
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readonly) {
            this.value = "n";
            StateStorage.writeExtra("dungeontype", this.ref, 'n');
        }
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-dungeontype', HTMLTrackerDungeonType);