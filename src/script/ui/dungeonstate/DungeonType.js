import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus.js";
import "/deepJS/ui/selection/Option.js";
import TrackerLocalState from "/script/util/LocalState.js";

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
        }
        slot {
            width: 100%;
            height: 100%;
        }
        ::slotted(:not([value])),
        ::slotted([value]:not(.active)) {
            display: none !important;
        }
        ::slotted([value]) {
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
    <slot>
    </slot>
`);

function updateCall(event) {
    EventBus.mute("dungeon-type-update");
    this.value = TrackerLocalState.read("dungeonTypes", this.ref, "n");
    EventBus.unmute("dungeon-type-update");
}

function dungeonTypeUppdate(event){
    if (this.ref === event.data.name && this.value !== event.data.value) {
        EventBus.mute("dungeon-type-update");
        this.value = event.data.value;
        EventBus.unmute("dungeon-type-update");
    }
}

class HTMLTrackerDungeonType extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.revert);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        EventBus.register("force-dungeonstate-update", updateCall.bind(this));
        EventBus.register(["dungeon-type-update","net:dungeon-type-update"], dungeonTypeUppdate.bind(this));
    }

    connectedCallback() {
        if (!this.value) {
            let all = this.querySelectorAll("[value]");
            if (!!all.length) {
                this.value = all[0].value;
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
                    if (newValue === "") {
                        this.innerHTML = "";
                        EventBus.mute("dungeon-type-update");
                        this.value = "";
                        EventBus.unmute("dungeon-type-update");
                    } else if (oldValue === null || oldValue === undefined || oldValue === "") {
                        this.append(createOption("n", "/images/type_undefined.svg"));
                        this.append(createOption("v", "/images/type_vanilla.svg"));
                        this.append(createOption("mq", "/images/type_masterquest.svg"));
                        EventBus.mute("dungeon-type-update");
                        this.value = TrackerLocalState.read("dungeonTypes", newValue, "n");
                        EventBus.unmute("dungeon-type-update");
                    }
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let oe = this.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                    TrackerLocalState.write("dungeonTypes", this.ref, newValue);
                    EventBus.trigger("dungeon-type-update", {
                        name: this.ref,
                        value: newValue
                    });
                }
            break;
        }
    }

    next(ev) {
        let all = this.querySelectorAll("[value]");
        if (!!all.length) {
            let opt = this.querySelector(`[value="${this.value}"]`);
            if (!!opt) {
                if (!!opt.nextElementSibling) {
                    this.value = opt.nextElementSibling.getAttribute("value");
                } else {
                    this.value = all[1].getAttribute("value");
                }
            }
        }
        ev.preventDefault();
        return false;
    }

    revert(ev) {
        this.value = "n";
        ev.preventDefault();
        return false;
    }

}

customElements.define('ootrt-dungeontype', HTMLTrackerDungeonType);

function createOption(value, img) {
    let opt = document.createElement('deep-option');
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    return opt;
}