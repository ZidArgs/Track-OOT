import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
    </style>
    <div id="head" class="header">SKIP</div>
    <div id="ref" class="body"></div>
`);

export default class TrackerLogicSkip extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.appendChild(TPL.generate());
        EventBus.on("settings", () => {
            this.update();
        });
    }

    update() {
        this.value = TrackerLocalState.read("skips", this.ref, GlobalData.get("settings").skips[this.ref].default);
        this.shadowRoot.getElementById("head").dataset.value = this.value;
    }

    toJSON() {
        if (this.children.length > 0) {
            let el = this.children[0];
            if (!!el) {
                el = el.toJSON();
            }
            return {
                type: "skip",
                el: this.ref
            };
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
                    this.shadowRoot.getElementById("ref").innerHTML = this.ref;
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

DeepLogicAbstractElement.registerReference("skip", TrackerLogicSkip);
customElements.define('tracker-logic-skip', TrackerLogicSkip);