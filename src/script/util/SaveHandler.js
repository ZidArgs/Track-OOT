import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Dialog from "/deepJS/ui/Dialog.js";
import Toast from "/deepJS/ui/Toast.js";
import SaveState from "/script/storage/SaveState.js";
import LoadWindow from "/script/ui/savestate/LoadWindow.js";
import ManageWindow from "/script/ui/savestate/ManageWindow.js";
import SaveWindow from "/script/ui/savestate/SaveWindow.js";

const stateSave = document.getElementById("save-savestate");
const stateSaveAs = document.getElementById("saveas-savestate");
const stateLoad = document.getElementById("load-savestate");
const stateNew = document.getElementById("new-savestate");
const statesManage = document.getElementById("manage-savestates");
const notePad = document.getElementById("tracker-notes");

stateSave.addEventListener("click", state_Save);
stateSaveAs.addEventListener("click", state_SaveAs);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
statesManage.addEventListener("click", states_Manage);

async function state_Save() {
    let activestate = await SaveState.getName()
    if (!!activestate) {
        await SaveState.save();
        Toast.show(`Saved "${activestate}" successfully.`);
    } else {
        state_SaveAs();
    }
}

async function state_SaveAs() {
    let w = new SaveWindow();
    w.show();
}

async function state_Load() {
    let w = new LoadWindow();
    w.show();
}

async function state_New() {
    if (!!await SaveState.getName()) {
        if (await Dialog.confirm("Warning", "Do you really want to create a new savestate? Unsaved changes will be lost.")) {
            SaveState.reset();
        }
    }
}

async function states_Manage() {
    let w = new ManageWindow();
    w.show();
}

class SaveHandler {

    async init() {
        notePad.value = SaveState.read("notes", "");
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
        async function writeNotePadValue() {
            SaveState.write("notes", notePad.value);
        };
        EventBus.register("state", function(event) {
            notePad.value = event.data.data["notes"] || "";
        });
    }

}

export default new SaveHandler;