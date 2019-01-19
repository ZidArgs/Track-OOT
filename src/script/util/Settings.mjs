import GlobalData from "deepJS/storage/GlobalData.mjs";
import DeepLocalStorage from "deepJS/storage/LocalStorage.mjs";
import SettingsWindow from "deepJS/ui/SettingsWindow.mjs";
import EventBus from "deepJS/util/EventBus.mjs";
import FileLoader from "deepJS/util/FileLoader.mjs";
import TrackerLocalState from "./LocalState.mjs";
import I18n from "./I18n.mjs";

const settings = new SettingsWindow;
const settingsEdit = document.getElementById("edit-settings");

settings.innerHTML = `
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
            <a href="CHANGELOG" target="_BLANK">see the changelog</a>
        </div>
        <hr>
        <div id="update-check" style="padding: 5px;">
            checking for new version...
        </div>
        <div id="update-available" style="padding: 5px; display: none;">
            newer version found <button id="download-update">download</button>
            <br>
            <a href="CHANGELOG?nosw" target="_BLANK">see the changelog</a>
        </div>
        <div id="update-unavailable" style="padding: 5px; display: none;">
            already up to date <button id="check-update">check again</button>
        </div>
        <div id="update-running" style="padding: 5px; display: none;">
            <progress id="update-progress" value="0" max="0"></progress>
        </div>
        <div id="update-finished" style="padding: 5px; display: none;">
            you need to reload for the new version to apply...
            <button onclick="window.location.reload()">reload now</button>
        </div>
    </div>
    <div style="width: 200px; height: 200px; background-image: url('images/logo.svg'); background-size: contain; background-position: left; background-repeat: no-repeat;"></div>
</div>
<hr>
<div>
Please be aware, that the logic of this tracker (mostly) follows the randomizer logic.<br>
This is due to the fact, that the logic of the randomizer is a good estimation of the logic of the game itself.<br>
If the tracker acts weird, please <a href="https://bitbucket.org/2deep4real/track-oot/issues" target="_blank" rel="noreferrer">report the error!</a><br><br>
You can also report via Discord ▶ <a href="https://discord.gg/wgFVtuv" target="_blank" rel="noreferrer">Join my Discord!</a><br><br>
</div>
<hr>
<div>
Big thanks to:<br>
<i class="thanks-name">TestRunner</i> for creating the original tracker.<br>
<i class="thanks-name">Scatter</i> for building a logic compendium.<br>
<i class="thanks-name">fraggerman</i> for helping with the logic.<br>
<i class="thanks-name">Luigimeansme</i> for helping with adding Master Quest.
</div>
`;

!function() {
    let data = GlobalData.get("version");
    let version = settings.querySelector("#tracker-version");
    let date = settings.querySelector("#tracker-date");
    if (data.dev) {
        version.innerHTML = `DEV [${data.commit.slice(0,7)}]`;
    } else {
        version.innerHTML = data.version;
    }
    let b = new Date(data.date);
    let d = {
        D: ("00"+b.getDate()).slice(-2),
        M: ("00"+b.getMonth()+1).slice(-2),
        Y: b.getFullYear(),
        h: ("00"+b.getHours()).slice(-2),
        m: ("00"+b.getMinutes()).slice(-2),
        s: ("00"+b.getSeconds()).slice(-2)
    };
    date.innerHTML = `${d.D}.${d.M}.${d.Y} ${d.h}:${d.m}:${d.s}`;
}();

if ('serviceWorker' in navigator) {
    let prog = settings.querySelector("#update-progress");

    function swStateRecieve(event) {
        if (event.data.type == "state") {
            switch(event.data.msg) {
                case "update_available":
                    settings.querySelector("#update-check").style.display = "none";
                    settings.querySelector("#update-available").style.display = "block";
                break;
                case "update_unavailable":
                    settings.querySelector("#update-check").style.display = "none";
                    settings.querySelector("#update-unavailable").style.display = "block";
                break;
                case "need_download":
                    prog.value = 0;
                    prog.max = event.data.value;
                break;
                case "file_downloaded":
                    prog.value = parseInt(prog.value) + 1;
                break;
                case "update_finished":
                    settings.querySelector("#update-running").style.display = "none";
                    settings.querySelector("#update-finished").style.display = "block";
                break;
            }
        }
    }
    navigator.serviceWorker.addEventListener('message', swStateRecieve);

    navigator.serviceWorker.getRegistration().then(function(registration) {
        registration.active.postMessage("check");
    });
    
    settings.querySelector("#check-update").onclick = function() {
        settings.querySelector("#update-unavailable").style.display = "none";
        settings.querySelector("#update-check").style.display = "block";
        navigator.serviceWorker.getRegistration().then(function(registration) {
            registration.active.postMessage("check");
        });
    }

    settings.querySelector("#download-update").onclick = function() {
        settings.querySelector("#update-available").style.display = "none";
        settings.querySelector("#update-running").style.display = "block";
        navigator.serviceWorker.getRegistration().then(function(registration) {
            registration.active.postMessage("update");
        });
    }
}

settingsEdit.addEventListener("click", function() {
    settings.show(getSettings(), 'settings');
});

settings.addEventListener('submit', function(event) {
    for (let i in event.data) {
        for (let j in event.data[i]) {
            if (i === "settings") {
                DeepLocalStorage.set(i, j, event.data[i][j]);
            } else {
                TrackerLocalState.write(i, j, event.data[i][j]);
            }
        }
    }
    applySettingsChoices();
    EventBus.post("global-update");
});

function getSettings() {
    let options = GlobalData.get("settings");
    let res = {};
    for (let i in options) {
        res[i] = res[i] || {};
        if (i === "settings") {
            for (let j in options[i]) {
                res[i][j] = DeepLocalStorage.get(i, j, options[i][j].default);
            }
        } else {
            for (let j in options[i]) {
                res[i][j] = TrackerLocalState.read(i, j, options[i][j].default);
            }
        }
    }
    return res;
}
    
function applySettingsChoices() {
    var viewpane = document.getElementById("viewpane");
    viewpane.setAttribute("data-font", DeepLocalStorage.get("settings", "font", ""));
    document.querySelector("#layout-container").setAttribute("layout", DeepLocalStorage.get("settings", "layout", "map-compact"));
    document.body.style.setProperty("--item-size", DeepLocalStorage.get("settings", "itemsize", 40));
    if (DeepLocalStorage.get("settings", "show_hint_badges", false)) {
        document.body.setAttribute("data-hint-badges", "true");
    } else {
        document.body.setAttribute("data-hint-badges", "false");
    }
    if (TrackerLocalState.read("options", "scrubsanity", false)) {
        document.body.setAttribute("data-scrubsanity", "true");
    } else {
        document.body.setAttribute("data-scrubsanity", "false");
    }
}

!function() {
    let options = GlobalData.get("settings");
    for (let i in options) {
        settings.addTab(I18n.translate(i), i);
        for (let j in options[i]) {
            let val = options[i][j];
            let label = I18n.translate(j);
            let min = parseFloat(val.min);
            let max = parseFloat(val.max);
            switch (val.type) {
                case "string":
                    settings.addStringInput(i, label, j, val.default);
                break;
                case "number":
                    settings.addNumberInput(i, label, j, val.default, min, max);
                break;
                case "range":
                    settings.addRangeInput(i, label, j, val.default, min, max);
                break;
                case "check":
                    settings.addCheckInput(i, label, j, val.default);
                break;
                case "choice":
                    let opt = {};
                    for (let k in val.values) {
                        if (val.hasOwnProperty("names") && val.names.hasOwnProperty(k)) {
                            opt[val.values[k]] = I18n.translate(val.names[k]);
                        } else {
                            opt[val.values[k]] = I18n.translate(val.values[k]);
                        }
                    }
                    settings.addChoiceInput(i, label, j, val.default, opt);
                break;
                case "button":
                    if (j == "edit_custom_logic") {
                        settings.addButton(i, label, j, I18n.translate(val.text), e => {
                            window.open("editor.html", '_blank');
                        });
                    } else if (j == "erase_all_data") {
                        settings.addButton(i, label, j, I18n.translate(val.text), e => {});
                    }
                break;
            }
        }
    }
    applySettingsChoices();
}();
