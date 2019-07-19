import GlobalData from "/deepJS/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import {svg2png} from "/deepJS/util/Helper.js";
import Dialog from "/deepJS/ui/Dialog.js";
import "/deepJS/ui/ContextMenu.js";
import TrackerLocalState from "/script/util/LocalState.js";
import Logic from "/script/util/Logic.js";
import I18n from "/script/util/I18n.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            width: 100%;
        }
        #text {
            flex: 1;
            color: var(--location-status-unavailable-color, #000000);
        }
        #text.avail {
            color: var(--location-status-available-color, #000000);
        }
        :host([checked="true"]) #text {
            color: var(--location-status-opened-color, #000000);
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
        #badge deep-icon {
            width: 20px;
            height: 20px;
        }
        .menu-tip {
            font-size: 0.7em;
            color: #777777;
            margin-left: 15px;
            float: right;
        }
    </style>
    <div id="text"></div>
    <div id="badge"></div>
    <deep-contextmenu id="menu">
        <div id="menu-check" class="item">Check<span class="menu-tip">(leftclick)</span></div>
        <div id="menu-uncheck" class="item">Uncheck<span class="menu-tip">(ctrl + rightclick)</span></div>
        <div class="splitter"></div>
        <div id="menu-logic" class="item">Show Logic</div>
        <div id="menu-logic-image" class="item">Create Logic Image</div>
    </deep-contextmenu>
`);

function locationUpdate(event) {
    if (this.ref === event.data.name && this.checked !== event.data.value) {
        EventBus.mute("location-update");
        this.checked = event.data.value;
        EventBus.unmute("location-update");
    }
}

function globalUpdate(event) {
    let path = this.ref.split(".");
    EventBus.mute("location-update");
    this.checked = TrackerLocalState.read("skulltulas", path[2], false);
    EventBus.unmute("location-update");
}

function logicUpdate(event) {
    let path = this.ref.split(".");
    if (event.data.type == "skulltulas" && event.data.ref == path[2]) {
        let el = this.shadowRoot.getElementById("text");
        if (!!event.data.value) {
            el.classList.add("avail");
        } else {
            el.classList.remove("avail");
        }
    }
}

function showLogic(ref) {
    let path = ref.split(".");
    let l = Logic.getLogicView("skulltulas", path[2]);
    if (!!l) {
        let d = new Dialog({
            title: I18n.translate(path[2]),
            submit: "OK"
        });
        d.value = ref;
        d.append(l);
        d.show();
    }
}

async function printLogic(ref) {
    let path = ref.split(".");
    let svg = Logic.getLogicSVG("skulltulas", path[2]);
    let png = await svg2png(svg);
    let svg_win = window.open("", "_blank", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no");
    let img = document.createElement("img");
    img.src = png;
    svg_win.document.body.append(img);
}

function click(event) {
    this.check();
    event.preventDefault();
    return false;
}

function unclick(event) {
    this.uncheck();
    event.preventDefault();
    return false;
}

function contextMenu(event) {
    if (event.ctrlKey) {
        this.uncheck();
    } else {
        this.shadowRoot.getElementById("menu").show(event.clientX, event.clientY);
    }
    event.preventDefault();
    return false;
}

class HTMLTrackerLocationSkulltula extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", click.bind(this));
        this.addEventListener("contextmenu", contextMenu.bind(this));
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* context menu */
        this.shadowRoot.getElementById("menu-check").addEventListener("click", click.bind(this));
        this.shadowRoot.getElementById("menu-uncheck").addEventListener("click", unclick.bind(this));
        this.shadowRoot.getElementById("menu-logic").addEventListener("click", function(event) {
            showLogic(this.ref);
        }.bind(this));
        this.shadowRoot.getElementById("menu-logic-image").addEventListener("click", function(event) {
            printLogic(this.ref);
        }.bind(this));
        /* event bus */
        EventBus.register(["location-update", "net:location-update"], locationUpdate.bind(this));
        EventBus.register("force-location-update", globalUpdate.bind(this));
        EventBus.register("logic", logicUpdate.bind(this));
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get checked() {
        return this.getAttribute('checked');
    }

    set checked(val) {
        this.setAttribute('checked', val);
    }

    static get observedAttributes() {
        return ['ref', 'checked'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let path = newValue.split('.');
                    let data = GlobalData.get("locations")[path[0]];
                    data = data[path[1]][path[2]];
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(path[2]);

                    this.shadowRoot.getElementById("badge").innerHTML = "";

                    let el_time = document.createElement("deep-icon");
                    el_time.src = `images/time_${data.time || "both"}.svg`;
                    this.shadowRoot.getElementById("badge").append(el_time);

                    let el_era = document.createElement("deep-icon");
                    el_era.src = `images/era_${data.era || "both"}.svg`;
                    this.shadowRoot.getElementById("badge").append(el_era);

                    if (Logic.getValue("skulltulas", path[2])) {
                        txt.classList.add("avail");
                    } else {
                        txt.classList.remove("avail");
                    }

                    this.checked = TrackerLocalState.read("skulltulas", path[2], false);
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    let path = this.ref.split(".");
                    if (!newValue || newValue === "false") {
                        let el = this.shadowRoot.getElementById("text");
                        if (Logic.getValue("skulltulas", path[2])) {
                            el.classList.add("avail");
                        } else {
                            el.classList.remove("avail");
                        }
                    }
                    TrackerLocalState.write("skulltulas", path[2], newValue === "false" ? false : !!newValue);
                    EventBus.trigger("location-update", {
                        name: this.ref,
                        value: newValue
                    });
                }
            break;
        }
    }

    check() {
        Logger.log(`check location "${this.ref}"`, "Location");
        this.checked = true;
    }
    
    uncheck() {
        Logger.log(`uncheck location "${this.ref}"`, "Location");
        this.checked = false;
    }

}

customElements.define('ootrt-listlocationskulltula', HTMLTrackerLocationSkulltula);