import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Logger from "/emcJS/util/Logger.js";

import TrackerSettingsWindow from "/script/ui/TrackerSettingsWindow.js";
import RandomizerOptionsWindow from "/script/ui/RandomizerOptionsWindow.js";
import StateStorage from "/script/storage/StateStorage.js";

import "/emcJS/ui/Icon.js";
import "/emcJS/ui/selection/ChoiceSelect.js";
import "/script/util/Navigation.js";
import "/script/ui/LocationStatus.js";

(async function main() {

    if ("SharedWorker" in window) {
        let EventBusModuleShare = (await import("/emcJS/util/events/EventBusModuleShare.js")).default;
        EventBusModuleShare.mute("logic");
        EventBus.addModule(EventBusModuleShare);
    }

    updateLoadingMessage("apply logger...");
    if (!!MemoryStorage.get("version-dev")) {
        Logger.addOutput(document.getElementById("tracker-log"));
        //Logger.addOutput(console);
        EventBus.register(function(event) {
            Logger.info(JSON.stringify(event), "Event");
        });
    } else {
        document.getElementById("tab_log_top").style.display = "none";
        document.getElementById("tab_log_bottom").style.display = "none";
    }

    updateLoadingMessage("initialize components...");
    initComponents();

    updateLoadingMessage("initialize settings...");
    // TODO create navigation component class
    // TODO make better use of navigation component once it is declared
    window.TrackerSettingsWindow = new TrackerSettingsWindow();
    window.RandomizerOptionsWindow = new RandomizerOptionsWindow();

    updateLoadingMessage("add modules...");

    document.getElementById("view-choice-top").onchange = changeView;
    document.getElementById("view-choice-bottom").onchange = changeView;
    changeView({
        oldValue:"",
        newValue:document.getElementById("view-choice-bottom").value
    });

    await Promise.all([
        $import.importModule("/script/ui/shops/ShopList.js"),
        $import.importModule("/script/ui/songs/SongList.js"),
        $import.importModule("/script/ui/multiplayer/Multiplayer.js"),
        $import.importModule("/script/ui/LayoutContainer.js")
    ]);

    updateLoadingMessage("wake up...");
    let spl = document.getElementById("splash");
    if (!!spl) {
        spl.className = "inactive";
    }

    window.addEventListener('keydown', function(event) {
        if (event.ctrlKey == true && event.altKey == true && event.key == "i") {
            window.open('detached.html#items', "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0", false);
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        if (event.ctrlKey == true && event.key == "z") {
            StateStorage.undo();
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
        if (event.ctrlKey == true && event.key == "y") {
            StateStorage.redo();
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

}());

window.onbeforeunload = function() {
    return "Are you sure you want to close the tracker?\nUnsafed progress will be lost.";
}

document.getElementById("hamburger-button").onclick = function(event) {
    document.getElementById("menu").classList.toggle("open");
}

function addHTMLModule(name, target) {
    let el = document.createElement(name);
    document.getElementById(target).append(el);
    return el;
}

function initComponents() {
    let notePad = document.getElementById("tracker-notes");
    notePad.value = StateStorage.read("notes", "");
    let notePadTimer = null;
    notePad.oninput = function() {
        if (!!notePadTimer) {
            clearTimeout(notePadTimer);
        }
        notePadTimer = setTimeout(writeNotePadValue, 1000);
    }
    notePad.oncontextmenu = function(event) {
        event.stopPropagation();
    }
    function writeNotePadValue() {
        StateStorage.write("notes", notePad.value);
    };
    EventBus.register("state", function(event) {
        notePad.value = event.data["notes"] || "";
    });
}

function changeView(event) {
    let o = document.querySelector(`#main-content #view-${event.oldValue}`);
    if (!!o) {
        o.classList.remove('active');
    }
    let n = document.querySelector(`#main-content #view-${event.newValue}`);
    if (!!n) {
        n.classList.add('active');
    }
    document.getElementById("view-choice-top").value = event.newValue;
    document.getElementById("view-choice-bottom").value = event.newValue;
}