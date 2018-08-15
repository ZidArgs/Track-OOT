var data;
var savestate = new SaveState();
var activestate = "";

var stateChoice = document.getElementById("select-savegame");
var stateSave = document.getElementById("save-savegame");
var stateLoad = document.getElementById("load-savegame");
var stateNew = document.getElementById("new-savegame");
var stateDel = document.getElementById("delete-savegame");
var stateExport = document.getElementById("export-savegame");
var stateImport = document.getElementById("import-savegame");

stateChoice.addEventListener("change", function() {
    if (activestate == stateChoice.value) {
        stateSave.disabled = false;
    } else {
        stateSave.disabled = true;
    }
    stateLoad.disabled = false;
    stateDel.disabled = false;
    stateExport.disabled = false;
});
stateSave.addEventListener("click", state_Save);
stateLoad.addEventListener("click", state_Load);
stateNew.addEventListener("click", state_New);
stateDel.addEventListener("click", state_Delete);
stateExport.addEventListener("click", state_Export);
stateImport.addEventListener("click", state_Import);

document.getElementById("map-scale-slider").addEventListener("input", function(event) {
    document.getElementById('map').style.setProperty("--map-scale", parseInt(event.target.value) / 100);
});
document.getElementById("map-option-chest").addEventListener("click", function(event) {
    document.getElementById('map').setAttribute("data-mode", "chest");
    updateMap();
});
document.getElementById("map-option-skulltula").addEventListener("click", function(event) {
    document.getElementById('map').setAttribute("data-mode", "skulltula");
    updateMap();
});

function changeItemInactiveEffect() {
    var cn = parseInt(document.getElementById("item-container").getAttribute("data-inactive")) || 0;
    if (++cn > 2) cn = 0;
    document.getElementById("item-container").setAttribute("data-inactive", cn);
}

/*************************************************
 *  Main function
 */

async function main() {

    data = await loadAll();
    setStatus("version", data.version);

    console.log("loaded database:\r\n%o", data);

    prepairSavegameChoice();

    createItemTracker();

    populateMap();

    //reset();
}

main();

function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
}

function setStatus(name, value) {
    document.getElementById("status-" + name).innerHTML = value;
}

function prepairSavegameChoice() {
    stateChoice.innerHTML = "<option disabled selected hidden value=\"\"> -- select state -- </option>";
    for (var i = 0; i < localStorage.length; ++i) {
        var el = document.createElement("option");
        el.id = localStorage.key(i);
        el.innerHTML = el.id;
        stateChoice.appendChild(el);
    }
    stateSave.disabled = true;
    stateLoad.disabled = true;
    stateDel.disabled = true;
    stateExport.disabled = true;
    if (activestate != "") {
        stateChoice.value = activestate;
    }
}

function reset() {
    for (var name in data.items) {
        savestate.items[name] = 0;
    }
    for (var name in data.chest_logic) {
        savestate.chests[name] = false;
    }
    updateItems();
    updateMap();
}

async function state_Save() {
    if (stateChoice.value != "") {
        stateChoice.value = activestate;
        localStorage.setItem(activestate, savestate.export());
        await dialogue_alert("Saved \""+activestate+"\" successfully.");
    }
}

async function state_Load() {
    if (stateChoice.value != "") {
        var confirm = true;
        if (activestate != "") {
            confirm = await dialogue_confirm("Do you really want to load? Unsaved changes will be lost.");
        }
        if (!!confirm) {
            var item = localStorage.getItem(stateChoice.value);
            if (item != "" && item != "null") {
                savestate = new SaveState(item);
            }
            stateSave.disabled = false;
            activestate = stateChoice.value;
            updateItems();
            updateMap();
        }
    }
}

async function state_Delete() {
    if (stateChoice.value != ""
    && await dialogue_confirm("Do you really want to delete \""+stateChoice.value+"\"?")) {
        localStorage.removeItem(stateChoice.value);
        if (stateChoice.value != activestate) {
            stateChoice.value = activestate;
            updateItems();
            updateMap();
        } else {
            activestate == "";
        }
        prepairSavegameChoice();
    }
}

async function state_New() {
    var name = await dialogue_prompt("Please enter a new name! (Unsafed changes will be lost.)");
    if (name == "") {
        dialogue_alert("The name can not be empty.");
        state_New();
        return;
    }
    if (localStorage.hasOwnProperty(name)) {
        dialogue_alert("The name already exists.");
        state_New();
        return;
    }
    if (!!name) {
        if (activestate != "" || await dialogue_confirm("Do you want to reset the current state?")) {
            savestate = new SaveState();
        }
        localStorage.setItem(name, savestate.export());
        prepairSavegameChoice();
        stateChoice.value = name;
        activestate = name;
        stateSave.disabled = false;
        stateLoad.disabled = false;
        stateDel.disabled = false;
        stateExport.disabled = false;
    }
}

async function state_Export() {
    if (stateChoice.value != "") {
        var confirm = true;
        if (activestate != "") {
            confirm = await dialogue_confirm("The last saved state will be exported.");
        }
        if (!!confirm) {
            var item = {
                name: stateChoice.value,
                data: JSON.parse(localStorage.getItem(stateChoice.value))
            };
            dialogue_alert("Here is your export string of the latest saved state:<br /><br />"+btoa(JSON.stringify(item)));
        }
    }
}

async function state_Import() {
    var data = await dialogue_prompt("Please enter export string!");
    if (data != null) {
        data = JSON.parse(atob(data));
        if (localStorage.hasOwnProperty(data.name) && !(await dialogue_confirm("There is already a savegame with this name. Replace savegame?."))) {
            return;
        }
        localStorage.setItem(data.name, JSON.stringify(data.data));
        prepairSavegameChoice();
        if (!!(await dialogue_confirm("Imported \""+data.name+"\" successfully.<br /><br />Do you want to load the imported state?" + (activestate == "" ? "" : " Unsaved changes will be lost.")))) {
            stateChoice.value = data.name;
            var item = localStorage.getItem(data.name);
            if (item != "" && item != "null") {
                savestate = new SaveState(item);
            }
            stateSave.disabled = false;
            stateLoad.disabled = false;
            stateDel.disabled = false;
            stateExport.disabled = false;
            activestate = data.name;
            updateItems();
            updateMap();
        }
    }
}

var dlg         = document.getElementById("dialogue");
var dlg_txt     = document.getElementById("dialogue_text");
var dlg_ok      = document.getElementById("dialogue_submit");
var dlg_abort   = document.getElementById("dialogue_abort");
var dlg_input   = document.getElementById("dialogue_input");
function dialogue_alert(msg) {
    return new Promise(function(resolve) {
        dlg.className = "alert";
        dlg_txt.innerHTML = msg;
        dlg_ok.onclick = function() {
            resolve(true);
            dlg.className = "";
        };
    });
}
function dialogue_confirm(msg) {
    return new Promise(function(resolve) {
        dlg.className = "confirm";
        dlg_txt.innerHTML = msg;
        dlg_ok.onclick = function() {
            resolve(true);
            dlg.className = "";
        };
        dlg_abort.onclick = function() {
            resolve(false);
            dlg.className = "";
        };
    });
}
function dialogue_prompt(msg) {
    return new Promise(function(resolve, reject) {
        dlg.className = "prompt";
        dlg_txt.innerHTML = msg;
        dlg_ok.onclick = function() {
            resolve(dlg_input.value);
            dlg.className = "";
            dlg_input.value = "";
        };
        dlg_abort.onclick = function() {
            resolve(null);
            dlg.className = "";
            dlg_input.value = "";
        };
    });
}