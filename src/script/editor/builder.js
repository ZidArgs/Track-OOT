
var chest_panel;
var chest_mq_panel;
var skulltula_panel;
var skulltula_mq_panel;
var gossip_panel;
var mixins_panel;
var item_panel;
var skips_panel;
var options_panel;
var mixin_panel;
var create_mixin_button;


function createListItem(category, id) {
    var el = document.createElement("div");
    el.className = "list-item";
    el.innerHTML = translate(id);
    el.id = category+"_"+id;
    el.setAttribute("title", id);
    el.onclick = new Function("loadLogic('"+category+"', '"+id+"')");
    if (data.logic_patched.hasOwnProperty(category) && data.logic_patched[category].hasOwnProperty(id))
        el.classList.add('has-custom-logic');
    return el;
}

function createElement(category, id) {
    var el = document.createElement("div");
    el.className = "logic-element logic-"+category;
    el.id = category+"_"+id;
    el.innerHTML = translate(id);
    el.setAttribute("title", id);
    el.setAttribute("draggable", true);
    el.ondragstart = dragNewElement;
    return el;
}

function createOption(category, id, val) {
    var el = createElement(category, id);
    if (val.type == "choice") {
        el.classList.add("logic-choice");
        var sel = document.createElement("select");
        sel.setAttribute("disabled", "true");
        for (let i in val.values) {
            var opt = document.createElement("option");
            opt.innerHTML = translate(val.values[i]);
            opt.setAttribute("value", val.values[i]);
            sel.appendChild(opt);
        }
        sel.value = val.default;
        el.appendChild(sel);
    }
    return el;
}

function createPanel(title, target) {
    var d = document.createElement("div");
    d.className = "panel panel-group collapsible";
    // head
    var h = document.createElement("div");
    h.className = "panel-header";
    h.innerHTML = title;
    h.onclick = function(ev) {
        ev.currentTarget.parentElement.classList.toggle("expanded");
    }
    d.appendChild(h);
    // body
    var b = document.createElement("div");
    b.className = "panel-body";
    d.appendChild(b);

    target.appendChild(d);

    return b;
}

async function createMixin(e) {
    var name = await Dialog.prompt("New mixin", "Please enter a new name!");
    if (name !== false) {
        if (name == "") {
            await Dialog.alert("Warning", "The name can not be empty.");
            state_New();
            return;
        }
        name = name.toLowerCase().replace(/ /g, "_");
        if (data.logic.mixins.hasOwnProperty(name)) {
            await Dialog.alert("Warning", "The name already exists.");
            state_New();
            return;
        }
        data.logic.mixins[name] = null;

        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(name);
        el.id = "mixins_"+name;
        el.setAttribute("title", name);
        el.onclick = new Function("loadLogic('mixins', '"+name+"')");
        el.classList.add('has-new-logic');
        mixins_panel.insertBefore(el, create_mixin_button);

        mixin_panel.appendChild(createElement("mixin", name));
    }
}

function fillEditor() {
    chest_panel = createPanel("Chests - Reachable Logic", logics_panel);
    skulltula_panel = createPanel("Skulltulas - Reachable Logic", logics_panel);
    gossip_panel = createPanel("Gossipstones - Reachable Logic", logics_panel);
    mixins_panel = createPanel("Mixins", logics_panel);
    
    item_panel = createPanel("Items", elements_panel);
    skips_panel = createPanel("Skips", elements_panel);
    options_panel = createPanel("Options", elements_panel);
    mixin_panel = createPanel("Mixins", elements_panel);

    document.getElementById("operator-panel").querySelector('.panel-header').onclick = function(ev) {
        ev.currentTarget.parentElement.classList.toggle("expanded");
    };
    
    for (let i in data.locations.overworld.gossipstones_v) {
        var el = createListItem("gossipstones", i);
        gossip_panel.appendChild(el);
    }
    
    for (let i in data.locations) {
        var chests = data.locations[i].chests_v;
        var skulltulas = data.locations[i].skulltulas_v;

        var chest_dungeon_panel = createPanel(translate(i), chest_panel);
        var skulltula_dungeon_panel = createPanel(translate(i), skulltula_panel);

        for (let j in chests) {
            var el = createListItem("chests", j);
            chest_dungeon_panel.appendChild(el);
        }
        if (!chests || !Object.keys(chests).length) {
            chest_dungeon_panel.innerHTML = "<i>No Elements</i>";
        }
        
        for (let j in skulltulas) {
            var el = createListItem("skulltulas", j);
            skulltula_dungeon_panel.appendChild(el);
        }
        if (!skulltulas || !Object.keys(skulltulas).length) {
            skulltula_dungeon_panel.innerHTML = "<i>No Elements</i>";
        }

        if (!!data.locations[i].hasmq) {
            var chests_mq = data.locations[i].chests_mq;
            var skulltulas_mq = data.locations[i].skulltulas_mq;
            var chest_dungeon_mq_panel = createPanel(translate(i) + " (MQ)", chest_panel);
            var skulltula_dungeon_mq_panel = createPanel(translate(i) + " (MQ)", skulltula_panel);

            for (let j in chests_mq) {
                var el = createListItem("chests", j);
                chest_dungeon_mq_panel.appendChild(el);
            }
            if (!chests_mq || !Object.keys(chests_mq).length) {
                chest_dungeon_mq_panel.innerHTML = "<i>No Elements</i>";
            }
            for (let j in skulltulas_mq) {
                var el = createListItem("skulltulas", j);
                skulltula_dungeon_mq_panel.appendChild(el);
            }
            if (!skulltulas_mq || !Object.keys(skulltulas_mq).length) {
                skulltula_dungeon_mq_panel.innerHTML = "<i>No Elements</i>";
            }
        }
    }
    for (let i in data.logic.mixins) {
        mixins_panel.appendChild(createListItem("mixins", i));
        mixin_panel.appendChild(createElement("mixin", i));
    }
    create_mixin_button = document.createElement("div");
    create_mixin_button.className = "list-item";
    create_mixin_button.innerHTML = "NEW MIXIN";
    create_mixin_button.onclick = createMixin;
    mixins_panel.appendChild(create_mixin_button);

    for (let i in data.logic_patched.mixins) {
        if (typeof data.logic.mixins[i] == "undefined") {
            var el = document.createElement("div");
            el.className = "list-item";
            el.innerHTML = translate(i);
            el.id = "mixins_"+i;
            el.setAttribute("title", i);
            el.onclick = new Function("loadLogic('mixins', '"+i+"')");
            el.classList.add('has-new-logic');
            mixins_panel.insertBefore(el, create_mixin_button);
            
            mixin_panel.appendChild(createElement("mixin", i));
        }
    }
    for (let i of Object.keys(data.items).sort()) {
        item_panel.appendChild(createElement("item", i));
    }
    for (let i in data.settings.options) {
        options_panel.appendChild(createOption("option", i, data.settings.options[i]));
    }
    for (let i in data.settings.skips) {
        skips_panel.appendChild(createOption("skip", i, data.settings.skips[i]));
    }
}