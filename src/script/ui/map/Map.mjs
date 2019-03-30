import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import "./POILocation.mjs";
import "./POIGossipstone.mjs";
import "./POIArea.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            align-items: stretch;
            justify-content: stretch;
            width: 100%;
            /*min-width: 825px;*/
            /*min-height: 466px;*/
            -moz-user-select: none;
            user-select: none;
            overflow: hidden;
        }
        #map-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            overflow: hidden;
        }
        #map {
            display: block;
            width: 820px;
            height: 460px;
            flex-shrink: 0;
            background-repeat: no-repeat;
            background-size: 100%;
            background-position: center;
            background-origin: content-box;
            background-image: url("/images/map.png");
            transform-origin: center;
            transform: translate(calc(var(--map-offset-x, 0) * 1px), calc(var(--map-offset-y, 0) * 1px)) scale(var(--map-zoom, 1));
        }
        #map-settings {
            position: absolute;
            display: flex;
            flex-direction: column;
            right: 0;
            bottom: -164px;
            width: 250px;
            height: 164px;
            font-family: Arial, sans-serif;
            background-color: black;
            border-style: solid;
            border-width: 2px;
            border-color: var(--page-border-color-inverted, #ffffff);
            transition: bottom 1s;
        }
        #map-settings.active {
            bottom: 0;
        }
        #toggle-button {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            right: 0;
            top: -42px;
            width: 40px;
            height: 40px;
            font-size: 30px;
            font-weight: bold;
            color: var(--navigation-text-color, #000000);
            background: var(--navigation-background-color, #ffffff);
            cursor: pointer;
        }
        #map-zoom {
            display: flex;
            align-items: center;
            flex: 1;
            padding: 0 8px;
        }
        #map-scale-slider {
            flex: 1;
            height: 7px;
            margin-left: 8px;
            -webkit-appearance: none;
            background: #cb9c3d;
        }
        #map-scale-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 10px;
            height: 100%;
            background: red;
            cursor: pointer;
        }
        #map-scale-slider::-moz-range-thumb {
            width: 10px;
            height: 100%;
            background: red;
            cursor: pointer;
        }
        #map-overview {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 138px;
            background-repeat: no-repeat;
            background-size: 100%;
            background-position: center;
            background-origin: content-box;
            background-image: url("/images/map.png");
            overflow: hidden;
        }
        #map-viewport {
            background-color: rgba(255,255,255,0.2);
            flex-shrink: 0;
            border: solid 2px red;
            pointer-events: none;
        }
    </style>
    <div id="map-wrapper">
        <slot id="map" style="--map-zoom: 1;">
        </slot>
        <div id="map-settings">
            <div id="toggle-button">⇑</div>
            <div id="map-zoom">
                <span class="slidetext">- / +</span>
                <input type="range" min="50" max="300" value="100" class="slider" id="map-scale-slider">
            </div>
            <div id="map-overview">
                <div id="map-viewport">
                </div>
            </div>
        </div>
    </div>
`);

function mapMoveBegin(event) {
    if (event.buttons === 1) {
        let target = event.target;
        if (target.id === "map") {
            target.classList.add("grabbed");
            target.addEventListener("mousemove", moveMap);
            target.addEventListener("mouseup", mapMoveEnd);
            target.addEventListener("mouseleave", mapMoveEnd);
        }
    }
}

function mapMoveEnd(event) {
    if (event.buttons === 1) {
        let target = event.target;
        target.classList.remove("grabbed");
        target.removeEventListener("mousemove", moveMap);
        target.removeEventListener("mouseup", mapMoveEnd);
        target.removeEventListener("mouseleave", mapMoveEnd);
    }
}

function moveMap(event) {
    // TODO clip translation to boundaries
    if (event.buttons === 1) {
        let target = event.target;
        if (target.id === "map") {
            let vrtX = parseInt(target.style.getPropertyValue("--map-offset-x") || 0);
            let vrtY = parseInt(target.style.getPropertyValue("--map-offset-y") || 0);
            target.style.setProperty("--map-offset-x", vrtX + event.movementX);
            target.style.setProperty("--map-offset-y", vrtY + event.movementY);
            mapContainBoundaries(target, target.parentNode);
        }
    }
}

function mapContainBoundaries(target, parent) {
    let mapvp = parent.querySelector("#map-viewport");

    let parW = parent.clientWidth;
    let parH = parent.clientHeight;

    let zoom = parseFloat(target.style.getPropertyValue("--map-zoom") || 1);

    let vrtX = parseInt(target.style.getPropertyValue("--map-offset-x") || 0);
    let vrtY = parseInt(target.style.getPropertyValue("--map-offset-y") || 0);
    let vrtW = target.clientWidth * zoom;
    let vrtH = target.clientHeight * zoom;

    if (parW > vrtW) {
        let dst = parW/2-vrtW/2;
        vrtX = Math.min(Math.max(-dst, vrtX), dst);
    } else {
        let dst = -(parW/2-vrtW/2);
        vrtX = Math.min(Math.max(-dst, vrtX), dst);
    }
    if (parH > vrtH) {
        let dst = parH/2-vrtH/2;
        vrtY = Math.min(Math.max(-dst, vrtY), dst);
    } else {
        let dst = -(parH/2-vrtH/2);
        vrtY = Math.min(Math.max(-dst, vrtY), dst);
    }

    target.style.setProperty("--map-offset-x", vrtX);
    target.style.setProperty("--map-offset-y", vrtY);

    let sW = 246 / vrtW * parW;
    let sH = 138 / vrtH * parH;
    mapvp.style.width = sW + "px";
    mapvp.style.height = sH + "px";
    mapvp.style.transform = `translate(${-vrtX * 246 / vrtW}px, ${-vrtY * 138 / vrtH}px)`;
}

function overviewSelect(event, map) {
    if (event.buttons === 1) {
        let evX = event.layerX;
        let evY = event.layerY;
        let zoom = parseFloat(map.style.getPropertyValue("--map-zoom") || 1);
        let vrtW = map.clientWidth * zoom;
        let vrtH = map.clientHeight * zoom;
        map.style.setProperty("--map-offset-x", -(evX - 123) * (vrtW / 246));
        map.style.setProperty("--map-offset-y", -(evY - 69) * (vrtH / 138));
        mapContainBoundaries(map, map.parentNode);
    }
    event.preventDefault();
    return false;
};

class HTMLTrackerMap extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        let map = this.shadowRoot.getElementById("map");
        let mapslide = this.shadowRoot.getElementById("map-scale-slider");
        this.addEventListener("wheel", event => {
            let zoom = parseFloat(map.style.getPropertyValue("--map-zoom") || 1);
            const delta = Math.sign(event.deltaY) / 50;
            zoom = Math.min(Math.max(0.5, zoom - delta), 3);
            mapslide.value = zoom * 100;
            map.style.setProperty("--map-zoom", zoom);
            mapContainBoundaries(map, map.parentNode);
            event.preventDefault();
            return false;
        });
        mapslide.addEventListener("input", event => {
            map.style.setProperty("--map-zoom", mapslide.value / 100);
            mapContainBoundaries(map, map.parentNode);
        });
        map.addEventListener("mousedown", mapMoveBegin);
        EventBus.on("location-mode-change", mode => this.mode = mode);
        EventBus.on("location-era-change", era => this.era = era);
        EventBus.on("force-location-update", event => {
            this.attributeChangedCallback("", "");
        });
        window.addEventListener("resize", e => {
            mapContainBoundaries(map, map.parentNode);
        });
        let mapview = this.shadowRoot.getElementById("map-overview");
        mapview.addEventListener("mousedown", event => overviewSelect(event, map));
        mapview.addEventListener("mousemove", event => overviewSelect(event, map));
        let settings = this.shadowRoot.getElementById("map-settings");
        let toggle = this.shadowRoot.getElementById("toggle-button");
        toggle.addEventListener("click", event => {
            if (settings.classList.contains("active")) {
                settings.classList.remove("active");
                toggle.innerHTML = "⇑";
            } else {
                mapContainBoundaries(map, map.parentNode);
                settings.classList.add("active");
                toggle.innerHTML = "⇓";
            }
        });
    }

    get mode() {
        return this.getAttribute('mode');
    }

    set mode(val) {
        this.setAttribute('mode', val);
    }

    get era() {
        return this.getAttribute('era');
    }

    set era(val) {
        this.setAttribute('era', val);
    }

    static get observedAttributes() {
        return ['mode', 'era'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            this.innerHTML = "";
            if (!!this.mode && this.mode !== "") {
                if (this.mode === "gossipstones") {
                    let data = GlobalData.get("locations")["overworld"][`gossipstones_v`];
                    if (!!data) {
                        Object.keys(data).forEach(i => {
                            let buf = data[i];
                            if (!buf.era || !this.era || this.era === buf.era) {
                                let el = document.createElement('ootrt-poigossipstone');
                                el.style.left = buf.x;
                                el.style.top = buf.y;
                                el.ref = i;
                                this.appendChild(el);
                            }
                        });
                    }
                } else {
                    let data = GlobalData.get("locations");
                    if (!!data) {
                        Object.keys(data).forEach(i => {
                            if (i === "overworld") {
                                let buff = GlobalData.get("locations")["overworld"][`${this.mode}_v`];
                                if (!!buff) {
                                    Object.keys(buff).forEach(j => {
                                        let buf = buff[j];
                                        if (!buf.era || !this.era || this.era === buf.era) {
                                            if (!buf.mode || TrackerLocalState.read("options", buf.mode, false)) {
                                                let el = document.createElement('ootrt-poilocation');
                                                el.style.left = buf.x;
                                                el.style.top = buf.y;
                                                el.ref = `overworld.${this.mode}.${j}`;
                                                this.appendChild(el);
                                            }
                                        }
                                    });
                                }
                            } else {
                                let el = document.createElement('ootrt-poiarea');
                                el.style.left = data[i].x;
                                el.style.top = data[i].y;
                                el.ref = i;
                                el.mode = this.mode;
                                this.appendChild(el);
                            }
                        });
                    }
                }
            }
        }
    }

}

customElements.define('ootrt-map', HTMLTrackerMap);