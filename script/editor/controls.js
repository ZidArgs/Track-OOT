function loadLogic(category, id) {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
    if (!!el.getAttribute("data-cat")) {
        document.getElementById(el.getAttribute("data-cat")+"_"+el.getAttribute("data-id")).classList.remove("active");
    }
    el.setAttribute("data-cat", category);
    el.setAttribute("data-id", id);
    var logic = null;
    if (data.logic_patched.hasOwnProperty(category) && data.logic_patched[category].hasOwnProperty(id)) {
        logic = data.logic_patched[category][id];
        el.innerHTML = translate(id) + " (local)";
    } else {
        logic = data.logic[category][id];
        el.innerHTML = translate(id) + " (remote)";
        if (Array.isArray(logic)) {
            logic = convertOldLogic(logic);
        }
    }
    document.getElementById(category+"_"+id).classList.add("active");
    setLogic(logic);
    exportLogic();
}

function loadRemoteLogic() {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
    var category = el.getAttribute("data-cat");
    var id = el.getAttribute("data-id");
    if (!category || !id) return;
    var logic = data.logic[category][id];
    el.innerHTML = translate(id) + " (remote)";
    if (Array.isArray(logic)) {
        logic = convertOldLogic(logic);
    }
    setLogic(logic);
    exportLogic();
}

function loadLocalLogic() {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
    var category = el.getAttribute("data-cat");
    var id = el.getAttribute("data-id");
    if (!category || !id) return;
    var logic = null;
    if (data.logic_patched.hasOwnProperty(category) && data.logic_patched[category].hasOwnProperty(id))
        logic = data.logic_patched[category][id];
    el.innerHTML = translate(id) + " (local)";
    setLogic(logic);
    exportLogic();
}

function saveLocalLogic() {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
    var category = el.getAttribute("data-cat");
    var id = el.getAttribute("data-id");
    if (!category || !id) return;
    data.logic_patched[category] = data.logic_patched[category] || {};
    data.logic_patched[category][id] = getLogic();
    document.getElementById(category+'_'+id).classList.add('has-custom-logic');
    Storage.set("settings", "logic", data.logic_patched);
}

function removeLocalLogic() {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
    var category = el.getAttribute("data-cat");
    var id = el.getAttribute("data-id");
    if (!category || !id) return;
    if (data.logic_patched.hasOwnProperty(category) && data.logic_patched[category].hasOwnProperty(id)) {
        delete data.logic_patched[category][id];
        Storage.set("settings", "logic", data.logic_patched);
        document.getElementById(category+'_'+id).classList.remove('has-custom-logic');
    }
}

function clearLocalLogic() {
    for (let i in data.logic_patched) {
        for (let j in data.logic_patched[i]) {
            document.getElementById(i+'_'+j).classList.remove('has-custom-logic');
        }
    }
    data.logic_patched = {};
    Storage.set("settings", "logic", data.logic_patched);
}

function downloadLogicPatch() {
    FileSystem.save(JSON.stringify(data.logic_patched, " ", 4), "logic_patch_"+Date.now()+".json");
}

function uploadLogicPatch() {
    FileSystem.load().then(function(content) {
        if (content.startsWith("data:application/json;base64,")) {
            content = content.slice(29);
        }
        var buffer = JSON.parse(atob(content));
        for (let i in buffer) {
            data.logic_patched[i] = data.logic_patched[i] || {};
            for (let j in buffer[i]) {
                data.logic_patched[i][j] = buffer[i][j];
                document.getElementById(i+'_'+j).classList.add('has-custom-logic');
            }
        }
        Storage.set("settings", "logic", data.logic_patched);
    });
}

function downloadPatchedLogic() {
    var logic = JSON.parse(JSON.stringify(data.logic));
    for (let i in data.logic_patched) {
        logic[i] = logic[i] || {};
        for (let j in data.logic_patched[i]) {
            logic[i][j] = data.logic_patched[i][j];
        }
    }
    FileSystem.save(JSON.stringify(logic, " ", 4), "logic.json");
}