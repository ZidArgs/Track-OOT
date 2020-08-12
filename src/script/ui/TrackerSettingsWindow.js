import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import Template from "/emcJS/util/Template.js";
import FileData from "/emcJS/storage/FileData.js";
import SettingsWindow from "/emcJS/ui/SettingsWindow.js";
import PopOver from "/emcJS/ui/PopOver.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Dialog from "/emcJS/ui/Dialog.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import StateStorage from "/script/storage/StateStorage.js";

// TODO bind erase stored data button

const SettingsStorage = new IDBStorage('settings');

import SettingsBuilder from "/script/util/SettingsBuilder.js";

import "/emcJS/ui/Paging.js";
import "/script/ui/UpdateHandler.js";

const settings = new SettingsWindow;

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const SUPPORTER_URL = new URL("/patreon", location);

const ABOUT_TPL = new Template(`
<div style="display: flex; margin-bottom: 10px;">
    <div style="flex: 1">
        <div style="padding: 5px;">
            Tracker Version:
            <span id="tracker-version">DEV</span>
        </div>
        <div style="padding: 5px;">
            Version Date:
            <span id="tracker-date">01.01.2019 00:00:00</span>
        </div>
        <div style="padding: 5px;">
            <a href="CHANGELOG.MD" target="_BLANK">see the changelog</a>
        </div>
        <hr>
        <ootrt-updatehandler id="updatehandler"></ootrt-updatehandler>
    </div>
    <div style="width: 200px; height: 200px; background-image: url('images/logo.svg'); background-size: contain; background-position: left; background-repeat: no-repeat;"></div>
</div>
<hr>
<div>
    Please be aware, that the logic of this tracker (mostly) follows the randomizer logic.<br>
    This is due to the fact, that the logic of the randomizer is a good estimation of the logic of the game itself.<br>
    If the tracker acts weird, please <a href="https://bitbucket.org/zidargs/track-oot/issues" target="_blank" rel="noreferrer">report the error!</a><br><br>
    You can also report via Discord ▶ <a href="https://discord.gg/wgFVtuv" target="_blank" rel="noreferrer">Join my Discord!</a><br><br>
</div>
`);

const CREDITS_TPL = new Template(`
<style>
    #credits {
        height: 400px;
        display: flex;
        color: white;
        overflow: hidden;
    }
    #credits .panel {
        display: block;
        flex: 1;
        padding: 10px;
        margin: 1px;
        background-color: #282828;
    }
    #credits ul {
        padding-inline-start: 10px;
    }
    #credits .title {
        font-size: 1.2em;
        font-weight: bold;
    }
    #credits .name {
        list-style: none;
        padding: 5px 0;
        font-size: 1.5em;
    }
    #credits .name.owner {
        color: #cb9c3d;
    }
    #credits .name.developer {
        color: #ffdb00;
    }
    #credits .name.contributor {
        color: #ff2baa;
    }
    #credits #supporters .name {
        color: #a8a8a8;
    }
</style>
<div id="credits">
    <div class="panel">
        <label>
            <span class="title">Dev-Team</span>
            <ul>
                <li class="name owner">ZidArgs</li>
                <li class="name developer">fraggerman</li>
            </ul>
        </label>
        <label>
            <span class="title">Contributors</span>
            <ul>
                <li class="name contributor">Luigimeansme</li>
                <li class="name contributor">pidgezero_one</li>
                <li class="name contributor">Elagatua</li>
                <li class="name contributor">Takacomic</li>
            </ul>
        </label>
    </div>
    <div class="panel" id="supporters">
    </div>
</div>
`);

function createSupporterPanel(title, data) {
    if (data != null && Array.isArray(data.names) && data.names.length > 0) {
        let res = document.createElement("label");
        let ttl = document.createElement("span");
        ttl.classList.add("title");
        ttl.innerHTML = title;
        let lst = document.createElement("ul");
        for (let name of new Set(data.names)) {
            let el = document.createElement("li");
            el.classList.add("name");
            el.innerHTML = name;
            el.style.color = data.color || "";
            lst.append(el);
        }
        res.append(ttl);
        res.append(lst);
        return res;
    }
};

async function getSettings() {
    let options = FileData.get("settings");
    let res = {};
    for (let i in options) {
        let opt = options[i];
        if (opt.type === "list" || opt.type === "-list") {
            let def = new Set(opt.default);
            let val = [];
            for (let el of opt.values) {
                if (await SettingsStorage.get(i, def.has(el))) {
                    val.push(el);
                }
            }
            res[i] = val;
        } else {
            res[i] = await SettingsStorage.get(i, opt.default);
        }
    }
    return res;
}
    
async function applySettingsChoices(settings) {
    let viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
    document.body.style.setProperty("--item-size", settings.itemsize);
    StateStorage.setAutosave(settings.autosave_amount, settings.autosave_time);
}

async function showAbout() {
    settings.show({settings: await getSettings()}, 'about');
}

let showUpdatePopup = false;

export default class Settings {

    constructor() {
        let options = {
            settings: FileData.get("settings")
        };
        SettingsBuilder.build(settings, options);
        
        let settings_about = ABOUT_TPL.generate();
        settings_about.getElementById("tracker-version").innerHTML = MemoryStorage.get("version-string");
        settings_about.getElementById("tracker-date").innerHTML = MemoryStorage.get("version-date");
        let updatehandler = settings_about.getElementById("updatehandler");
        updatehandler.addEventListener("updateavailable", function() {
            if (showUpdatePopup) {
                showUpdatePopup = false;
                let popover = PopOver.show("A new update is available. Click here to download!", 60);
                popover.addEventListener("click", showAbout);
            }
        });
        updatehandler.addEventListener("noconnection", function() {
            if (!showUpdatePopup) {
                Dialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.");
            }
        });
        settings.addTab("About", "about");
        settings.addElements("about", settings_about);
    
        !async function() {
            let settings_credits = CREDITS_TPL.generate();
            let supporters_list = settings_credits.getElementById("supporters");
            let supporters = await fetch(SUPPORTER_URL).then(r=>r.json());
            for (let name in supporters) {
                let el = createSupporterPanel(name, supporters[name]);
                if (el != null) {
                    supporters_list.append(el);
                }
            }
            settings.addTab("Credits", "credits");
            settings.addElements("credits", settings_credits);
        }();
        

        settings.addEventListener('submit', function(event) {
            BusyIndicator.busy();
            let settings = {};
            let options = FileData.get("settings");
            for (let i in event.data.settings) {
                let v = event.data.settings[i];
                if (Array.isArray(v)) {
                    v = new Set(v);
                    options[i].values.forEach(el => {
                        settings[el] = v.has(el);
                        SettingsStorage.set(el, v.has(el));
                    });
                } else {
                    settings[i] = v;
                    SettingsStorage.set(i, v);
                }
            }
            applySettingsChoices(settings);
            EventBus.trigger("settings", settings);
            BusyIndicator.unbusy();
        });
        
        settings.addEventListener('close', function(event) {
            showUpdatePopup = true;
        });

        getSettings().then(applySettingsChoices);

        showUpdatePopup = true;
        updatehandler.checkUpdate();
    }

    async show() {
        showUpdatePopup = false;
        settings.show({settings: await getSettings()}, 'settings');
    }

}