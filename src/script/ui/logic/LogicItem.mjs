import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
        :host([visualize]:not([visualize="false"])[value]) .header:before {
            background-color: #85ff85;
            content: attr(data-value);
        }
        :host([visualize]:not([visualize="false"])[value="0"]) .header:before {
            background-color: #ff8585;
        }
    </style>
    <div id="head" class="header">ITEM</div>
    <div id="ref" class="body"></div>
`);

export default class TrackerLogicItem extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.appendChild(TPL.generate());
        EventBus.on(["item-update", "net:item-update"], function(event) {
            if (event.data.name == this.ref) {
                this.update();
            }
        }.bind(this));
        EventBus.on("force-logic-update", function(event) {
            this.update(event.data.value);
        }.bind(this));
    }

    update(value) {
        if (typeof value == "undefined") {
            this.value = TrackerLocalState.read("items", this.ref, 0);
        } else {
            this.value = parseInt(value)||0;
        }
        this.shadowRoot.getElementById("head").dataset.value = this.value;
    }

    toJSON() {
        return {
            type: "item",
            el: this.ref
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
                    this.shadowRoot.getElementById("ref").innerHTML = I18n.translate(this.ref);
                    this.update();
                }
                break;
        }
    }

    loadLogic(logic) {
        if (!!logic) {
            this.ref = logic.el;
        }
    }

}

DeepLogicAbstractElement.registerReference("item", TrackerLogicItem);
customElements.define('tracker-logic-item', TrackerLogicItem);