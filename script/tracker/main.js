// @koala-prepend "../utils/Dialog.js"
// @koala-prepend "../utils/SaveState.js"
// @koala-prepend "../utils/Storage.js"
// @koala-prepend "../utils/FileLoader.js"
// @koala-prepend "../utils/Splash.js"
// @koala-prepend "loader.js"
// @koala-prepend "logic.js"
// @koala-prepend "items.js"
// @koala-prepend "map.js"
// @koala-prepend "save.js"
// @koala-prepend "settings.js"

var data = {};

var map_scale_slider = document.getElementById("map-scale-slider");

map_scale_slider.addEventListener("input", function(ev) {
    document.getElementById('map').style.setProperty("--map-scale", parseInt(map_scale_slider.value) / 100);
});
map_scale_slider.addEventListener("change", function(ev) {
    document.getElementById('map').style.setProperty("--map-scale", parseInt(map_scale_slider.value) / 100);
    Storage.set("settings", "map_zoom", parseInt(map_scale_slider.value));
});
document.getElementById("map-option-chest").addEventListener("click", function(ev) {
    document.getElementById('map-container').setAttribute("data-mode", "chests");
    poi_list.mode = "chests";
    if (poi_list.ref != "") {
        document.getElementById("dungeon_"+poi_list.ref).click();
    }
    updateMap();
});
document.getElementById("map-option-skulltula").addEventListener("click", function(ev) {
    document.getElementById('map-container').setAttribute("data-mode", "skulltulas");
    poi_list.mode = "skulltulas";
    if (poi_list.ref != "") {
        document.getElementById("dungeon_"+poi_list.ref).click();
    }
    updateMap();
});
document.getElementById("map-option-shops").addEventListener("click", function(ev) {
    document.getElementById('shop-view').classList.add("active");
});
document.getElementById("shop-view-close-button").addEventListener("click", function(ev) {
    document.getElementById('shop-view').classList.remove("active");
});

window.onfocus = function(ev) {
    data.logic_patched = Storage.get("settings", "logic", {});
    updateMap();
}

window.oncontextmenu = function(ev) {
    ev.preventDefault();
    return false;
}

function changeItemInactiveEffect() {
    var cn = parseInt(document.getElementById("item-container").getAttribute("data-inactive")) || 0;
    if (++cn > 2) cn = 0;
    document.getElementById("item-container").setAttribute("data-inactive", cn);
}

/*************************************************
 *  Main function
 */

async function main() {

    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/script/ServiceWorker.js');
            console.log('Service Worker Registered');
        } catch(err) {
            console.error(err);
        }
    }

    FileLoader.onupdate = Splash.update;
    data = await loadAll();
    Splash.hide();

    map_scale_slider.value = Storage.get("settings", "map_zoom", 90);
    document.getElementById('map').style.setProperty("--map-scale", parseInt(map_scale_slider.value) / 100);

    buildSettings();

    prepairSavegameChoice();

    createItemTracker();

    populateMap();
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

document.getElementById("erase_all_data").onclick = function() {
    Dialog.prompt("Erase all data?", "You are about to erase all data.<br>Please enter \"ERAZE\" to continue.<br><br>Warning: This cant be undone!").then(function(res) {
        if (res === "ERAZE") {
            window.location = "deleted.html";
        }
    });
}