import GlobalData from "deepJS/storage/GlobalData.mjs";
import Template from "deepJS/util/Template.mjs";

const TPL = new Template(`
    <style id="dynamic-style">
        slot {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            grid-template-areas: 
            "item-grid" 
            "dungeon-status";
        }
        ::slotted(#location-list),
        ::slotted(#location-map) {
            display: none !important;
        }
    </style>
    <style>
        ::slotted(#item-grid) {
            grid-area: item-grid;
        }
        ::slotted(#dungeon-status) {
            grid-area: dungeon-status;
        }
        ::slotted(#location-map) {
            grid-area: location-map;
        }
        ::slotted(#location-list) {
            grid-area: location-list;
        }
        slot {
            --item-size: 40px;
            display: grid;
            justify-content: start;
            align-content: start;
            justify-items: stretch;
            align-items: stretch;
        }
        @media (max-width: $mobile-switch) {
            slot {
                grid-template-columns: 1fr;
                grid-template-rows: auto auto 1fr;
                grid-template-areas: 
                "item-grid" 
                "dungeon-status"
                "location-list";
            }
            ::slotted(#location-map) {
                display: none;
            }
        }
    </style>
    <slot>
    </slot>
`);

const PANELS = [
    "item-grid",
    "dungeon-status",
    "location-map",
    "location-list"
];

class HTMLTrackerLayoutContainer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
    }

    get layout() {
        return this.getAttribute('layout');
    }

    set layout(val) {
        this.setAttribute('layout', val);
    }

    static get observedAttributes() {
        return ['layout'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'layout':
                if (oldValue != newValue) {
                    let layout = GlobalData.get("layouts")[newValue];
                    if (!!layout) {
                        let style = this.shadowRoot.getElementById("dynamic-style").sheet;
                        let containerRules = style.cssRules[0].style;
                        let inactivePanel = new Set(PANELS);
                        let areas = [];
                        for (let i = 0; i < layout.areas.length; ++i) {
                            let a = [];
                            let b = layout.areas[i];
                            for (let j = 0; j < b.length; ++j) {
                                inactivePanel.delete(b[j]);
                                a.push(b[j]);
                            }
                            areas.push(`"${a.join(" ")}"`);
                        }
                        containerRules["grid-template-columns"] = layout.columns;
                        containerRules["grid-template-rows"] = layout.rows;
                        containerRules["grid-template-areas"] = areas.join(" ");
                        if (style.cssRules.length > 1) {
                            style.deleteRule(1);
                        }
                        let selectors = Array.from(inactivePanel);
                        if (selectors.length > 0) {
                            style.insertRule(`${selectors.map(e => `::slotted(#${e})`).join(",")}{display:none!important;}`, style.cssRules.length);
                        }
                    }
                }
            break;
        }
    }

}

customElements.define('ootrt-layoutcontainer', HTMLTrackerLayoutContainer);