import GlobalData from "/deepJS/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import "./ShopField.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            padding: 20px;
        }
    </style>
`);

export default class HTMLTrackerShopList extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        let shops = GlobalData.get("shops");
        for (let i in shops) {
            let el = document.createElement("ootrt-shopfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

customElements.define('ootrt-shoplist', HTMLTrackerShopList);