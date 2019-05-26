import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import MemoryStorage from "/deepJS/storage/MemoryStorage.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
        #selection.body.hidden {
            display: none;
        }
    </style>
    <div id="head" class="header">FILTER</div>
    <div id="ref" class="body"></div>
    <div id="selection" class="body hidden">
        <select id="select"></select>
    </div>
`);

const SELECTOR_VALUE = new WeakMap;

export default class TrackerLogicFilter extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        EventBus.on("filter", function(event) {
            if (event.data.ref == this.ref) {
                this.update();
            }
        }.bind(this));
        let select = this.shadowRoot.getElementById('select');
        select.addEventListener('change', function(event) {
            SELECTOR_VALUE.set(this, select.value);
        }.bind(this));
    }

    update() {
        let value = MemoryStorage.get("active_filter", this.ref, GlobalData.get("filter")[this.ref].default);
        if (SELECTOR_VALUE.has(this)) {
            value = value == SELECTOR_VALUE.get(this);
        }
        this.value = value;
        this.shadowRoot.getElementById("head").dataset.value = this.value;
    }

    toJSON() {
        let value;
        if (SELECTOR_VALUE.has(this)) {
            value = SELECTOR_VALUE.get(this);
        }
        return {
            type: "filter",
            el: this.ref,
            value: value
        };
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        let attr = DeepLogicAbstractElement.observedAttributes;
        attr.push('ref');
        return attr;
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let bdy = this.shadowRoot.getElementById("ref");
                    bdy.innerHTML = I18n.translate(this.ref);
                    let data = GlobalData.get("filter")[this.ref];
                    let el = this.shadowRoot.getElementById('select');
                    let slc = this.shadowRoot.getElementById('selection');
                    if (Array.isArray(data.values)) {
                        slc.classList.remove('hidden');
                        el.innerHTML = "";
                        for (let i of data.values) {
                            el.append(createOption(i, I18n.translate(i)));
                        }
                        if (SELECTOR_VALUE.has(this)) {
                            el.value = SELECTOR_VALUE.get(this);
                        } else {
                            el.value = data.default;
                        }
                    } else {
                        slc.classList.add('hidden');
                        el.innerHTML = "";
                        el.value = "";
                    }
                    this.update();
                }
                break;
            case 'readonly':
                if (oldValue != newValue) {
                    let select = this.shadowRoot.getElementById('select');
                    if (newValue != null) {
                        select.setAttribute("disabled", newValue);
                    } else {
                        select.removeAttribute("disabled");
                    }
                }
                break;
        }
    }

    loadLogic(logic) {
        if (!!logic) {
            if (!!logic.value) {
                SELECTOR_VALUE.set(this, logic.value);
            } else if (SELECTOR_VALUE.has(this)) {
                SELECTOR_VALUE.remove(this);
            }
            this.ref = logic.el;
        }
    }

}

DeepLogicAbstractElement.registerReference("filter", TrackerLogicFilter);
customElements.define('tracker-logic-filter', TrackerLogicFilter);

function createOption(value, content) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = content;
    return opt;
}