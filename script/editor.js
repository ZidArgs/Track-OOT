
/**
 * TODO: add clipboard/editor clear button
 * TODO: add save button
 * TODO: export as file (maybe with option to export patch only)
 */

async function run() {
    window.data = await loadAll();
    fillLogics();
    fillItems();
    document.getElementById('control-save-local').onclick = saveLocalLogic;
    document.getElementById('control-load-local').onclick = loadLocalLogic;
    document.getElementById('control-remove-local').onclick = removeLocalLogic;
    document.getElementById('control-clear-local').onclick = clearLocalLogic;
    document.getElementById('control-download-patch').onclick = downloadLogicPatch;
    document.getElementById('control-upload-patch').onclick = uploadLogicPatch;
    document.getElementById('control-download-patched').onclick = downloadPatchedLogic;
    document.getElementById('control-load-remote').onclick = loadRemoteLogic;
}
run();

function translate(index) {
    if (!!data.lang[index]) {
        return data.lang[index];
    }
    return index;
}

function fillLogics() {
    var cont;
    cont = document.getElementById("chest-panel").querySelector('.panel-body');
    for (let i in data.chests) {
        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(i);
        el.id = "chests_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic('chests', '"+i+"')");
        if (data.logic_patched.hasOwnProperty('chests') && data.logic_patched.chests.hasOwnProperty(i))
            el.classList.add('has-custom-logic');
        cont.appendChild(el);
    }
    for (let i in data.dungeons) {
        var chests = data.dungeons[i].chests;
        for (let j = 0; j < chests.length; ++j) {
            var el = document.createElement("div");
            el.className = "list-item";
            el.innerHTML = translate(i) + ": " + translate(chests[j]);
            el.id = "chests_"+chests[j];
            el.setAttribute("title", chests[j]);
            el.onclick = new Function("loadLogic('chests', '"+chests[j]+"')");
            if (data.logic_patched.hasOwnProperty('chests') && data.logic_patched.chests.hasOwnProperty(chests[j]))
                el.classList.add('has-custom-logic');
            cont.appendChild(el);
        }
    }
    cont = document.getElementById("skulltula-panel").querySelector('.panel-body');
    for (let i in data.logic.skulltulas) {
        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(i);
        el.id = "skulltulas_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic('skulltulas', '"+i+"')");
        if (data.logic_patched.hasOwnProperty('skulltulas') && data.logic_patched.skulltulas.hasOwnProperty(i))
            el.classList.add('has-custom-logic');
        cont.appendChild(el);
    }
    cont = document.getElementById("dungeon-panel").querySelector('.panel-body');
    for (let i in data.logic.dungeons) {
        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(i);
        el.id = "dungeons_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic('dungeons', '"+i+"')");
        if (data.logic_patched.hasOwnProperty('dungeons') && data.logic_patched.dungeons.hasOwnProperty(i))
            el.classList.add('has-custom-logic');
        cont.appendChild(el);
    }
}

function fillItems() {
    cont = document.getElementById("item-panel").querySelector('.panel-body');
    for (let i in data.items) {
        var el = document.createElement("div");
        el.className = "logic-item";
        el.id = "item_" + i;
        el.innerHTML = translate(i);
        el.setAttribute("title", i);
        el.setAttribute("draggable", true);
        el.ondragstart = dragNewElement;
        cont.appendChild(el);
    }
}

// load/save/download logic
function loadLogic(category, id) {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
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
    saveJSON(data.logic_patched, "logic_patch.json");
}

function uploadLogicPatch() {
    uploadJSON(data.logic_patched, "logic_patch.json");
}

function importLogicPatch() {

}

function downloadPatchedLogic() {
    var logic = JSON.parse(JSON.stringify(data.logic));
    for (let i in data.logic_patched) {
        logic[i] = logic[i] || {};
        for (let j in data.logic_patched[i]) {
            logic[i][j] = data.logic_patched[i][j];
        }
    }
    saveJSON(logic, "logic.json");
}

// export logic
function exportLogic() {
    var el = document.getElementById('editor-panel').querySelector('.panel-header');
    var cont = document.getElementById('output-panel').querySelector('.panel-body');
    var res = {};
    res[el.getAttribute("data-cat")] = {};
    res[el.getAttribute("data-cat")][el.getAttribute("data-id")] = getLogic();
    cont.innerHTML = JSON.stringify(res, " ", 4);
}

// convert old logic
function convertOldLogic(logic) {
    var res = {
        type:"or",
        el: []
    }
    for (let i = 0; i < logic.length; ++i) {
        var sub = {
            type: "and",
            el: []
        }
        for (let j = 0; j < logic[i].length; ++j) {
            var el = {el:null};
            var act = el;
            var item = logic[i][j];
            if (item.startsWith("!")) {
                item = item.slice(1);
                act.el = {
                    type: "not",
                    el: null
                };
                act = act.el;
            }
            var [itm, cnt] = item.split(":");
            if (!!cnt) {
                act.el = {
                    type: "value",
                    value: cnt,
                    el: null
                };
                act = act.el;
            }
            itm = itm.split(".");
            act.el = {
                type: itm[0].slice(0,-1),
                el: itm[1]
            };
            sub.el.push(el.el);
        }
        res.el.push(sub);
    }
    return res;
}

// test logic
function testLogic(data, logic) {
    if (!data) data = {items:{}};
    if (!logic) logic = getLogic();
    if (!logic || logic == null) return true;
    switch(logic.type) {
        case "and":
            if (!logic.el.length) return true;
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    if (!testLogic(data, el)) return false;
                }
            }
            return true;
        case "or":
            if (!logic.el.length) return true;
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    if (testLogic(data, el)) return true;
                }
            }
            return false;
        case "not":
            return !testLogic(data, logic.el);
        case "value":
            return testLogic(data, logic.el) >= logic.value;
        case "item":
            if (!data.items.hasOwnProperty(logic.el)) return 0;
            return data.items[logic.el];
    }
    return true;
}

// set/get logic
function setLogic(logic) {
    removeLogicEl(document.getElementById("editor-panel").querySelector(".panel-body > .logic-operator, .panel-body > .logic-item"));
    return recursiveSetLogic(logic, document.getElementById("editor-panel").querySelector('.panel-body > .placeholder'));
}

function recursiveSetLogic(logic, root) {
    if (logic == null) return null;
    switch(logic.type) {
        case "and":
            var a = addLogicEl(document.getElementById('logic-and'), root).querySelector('.placeholder');
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    recursiveSetLogic(el, a);
                }   
            }
            break;
        case "or":
            var a = addLogicEl(document.getElementById('logic-or'), root).querySelector('.placeholder');
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    recursiveSetLogic(el, a);
                }   
            }
            break;
        case "not":
            var a = addLogicEl(document.getElementById('logic-not'), root).querySelector('.placeholder');
            if (!!logic.el && logic.el != null) {
                recursiveSetLogic(logic.el, a);
            }
            break;
        case "value":
            var a = addLogicEl(document.getElementById('logic-value'), root);
            a.querySelector("input").value = logic.value;
            a = a.querySelector('.placeholder');
            if (!!logic.el && logic.el != null) {
                recursiveSetLogic(logic.el, a);
            }
            break;
        case "item":
            if (!!logic.el && logic.el != null) {
                addLogicEl(document.getElementById("item_"+logic.el), root);
            }
            break;
    }
    return null;
}

function getLogic() {
    return recursiveGetLogic(document.getElementById("editor-panel").querySelector(".panel-body > .logic-operator, .panel-body > .logic-item"));
}

function recursiveGetLogic(root) {
    if (!root || root == null) return null;
    switch (root.getAttribute("data-id")) {
        case null:
        case "":
            return null;
        case "logic-and":
            var res = {type:"and",el:[]};
            var ch = Array.from(root.querySelectorAll(":scope > .logic-operator, :scope > .logic-item"));
            ch.forEach(el=>{
                res.el.push(recursiveGetLogic(el));
            });
            return res;
        case "logic-or":
            var res = {type:"or",el:[]};
            var ch = Array.from(root.querySelectorAll(":scope > .logic-operator, :scope > .logic-item"));
            ch.forEach(el=>{
                res.el.push(recursiveGetLogic(el));
            });
            return res;
        case "logic-not":
            var el = root.querySelector(":scope > .logic-operator, :scope > .logic-item");
            return {type:"not",el:recursiveGetLogic(el)};
        case "logic-value":
            var el = root.querySelector(":scope > .logic-operator, :scope > .logic-item");
            return {type:"value",el:recursiveGetLogic(el),value:parseInt(root.querySelector("input").value)};
        default:
            return {type:"item",el:root.getAttribute("data-id").slice(5)};

    }
}

// operate logic elements
function moveLogicEl(el, target) {
    var old_parent = el.parentElement;
    var new_parent = target.parentElement;
    new_parent.insertBefore(el, target);
    if (!isMultiOperator(old_parent)) {
        old_parent.querySelector(".placeholder").style.display = "";
    }
    if (!isMultiOperator(new_parent)) {
        target.style.display = "none";
    }
    return el;
}

function addLogicEl(el, target) {
    el = el.cloneNode(true);
    el.setAttribute("data-id", el.id);
    el.id = "logic_onboard_"+(ID_CNT++);
    el.ondragstart = dragNewElement;
    var ph = el.querySelector(".placeholder");
    if (!!ph) {
        ph.ondrop = dropOnPlaceholder;
        ph.ondragover = allowDrop;
    }
    var parent = target.parentElement;
    parent.insertBefore(el, target);
    if (!isMultiOperator(parent)) {
        target.style.display = "none";
    }
    var input = el.querySelector('input');
    if (!!input) {
        input.onchange = exportLogic;
    }
    return el;
}

function removeLogicEl(el) {
    if (!el || el == null) return;
    if (el.id.startsWith("logic_onboard_")) {
        var parent = el.parentElement;
        parent.removeChild(el);
        if (!isMultiOperator(parent)) {
            parent.querySelector(".placeholder").style.display = "";
        }
    }
    return el;
}

// drag and drop
var ID_CNT = 0;

function isMultiOperator(p) {
    return p.classList.contains('logic-and') || p.classList.contains('logic-or');
}

function allowDrop(ev) {
    ev.preventDefault();
    ev.stopPropagation();
}

function dragNewElement(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function dropOnPlaceholder(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    var id = ev.dataTransfer.getData("text");
    var el = document.getElementById(id);
    if (id.startsWith("logic_onboard_")) {
        moveLogicEl(el, ev.target);
    } else {
        addLogicEl(el, ev.target);
    }
    exportLogic();
}

function deleteElement(ev) {
    var el = document.getElementById(ev.dataTransfer.getData("text"));
    removeLogicEl(el);
    exportLogic();
}

Array.from(document.getElementsByClassName('logic-operator')).forEach(element => {
    element.ondragstart = dragNewElement;
});

var uploadJSON = (function () {
    var a = document.createElement("input");
    a.setAttribute("type", "file");
    document.body.appendChild(a);
    a.style = "display: none";
    a.addEventListener("change", handleFiles, false);
    function handleFiles() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                var a = e.target.result;
                if (a.startsWith("data:application/json;base64,")) {
                    a = a.slice(29);
                }
                var b = JSON.parse(atob(a));
                for (let i in b) {
                    data.logic_patched[i] = data.logic_patched[i] || {};
                    for (let j in b[i]) {
                        data.logic_patched[i][j] = b[i][j];
                        document.getElementById(i+'_'+j).classList.add('has-custom-logic');
                    }
                }
                Storage.set("settings", "logic", data.logic_patched);
            };
        })(file);
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
    }
    return function () {
        a.click();
    };
}());

// save JSON (koldev - https://jsfiddle.net/koldev/cW7W5/)

var saveJSON = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());