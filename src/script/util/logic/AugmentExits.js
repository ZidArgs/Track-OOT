import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/logic/Logic.js";
import ExitRegistry from "/script/util/world/ExitRegistry.js";

const OPTIONS = {
    "option.shuffle_grottos": false,
    "option.shuffle_dungeons": false,
    "option.shuffle_overworld": false,
    "option.shuffle_owl": false,
    "option.shuffle_warps": false,
    "option.shuffle_spawns": false,
    "option.entrance_shuffle_interior": "entrance_shuffle_off"
};
const exit_binding = {};

function applyEntranceChanges(changes, edgeThere, edgeBack) {
    if (exit_binding[edgeThere] == edgeBack) return;
    const exitEntry = ExitRegistry.get(edgeThere);
    if (exitEntry == null) {
        console.error(`missing exit: ${edgeThere}`);
    } else {
        if (!exitEntry.active()) return;
        const [source, target] = edgeThere.split(" -> ");
        const entranceEntry = ExitRegistry.get(edgeBack);
        if (entranceEntry != null) {
            if (!entranceEntry.active() || exitEntry.getType() != entranceEntry.getType()) return;
            const [reroute, entrance] = edgeBack.split(" -> ");
            if (!!exit_binding[edgeThere]) {
                StateStorage.writeExtra("exits", exit_binding[edgeThere], "");
            }
            if (!!exit_binding[edgeBack]) {
                StateStorage.writeExtra("exits", exit_binding[edgeBack], "");
            }
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
            changes.push({source: `${reroute}[child]`, target: `${entrance}[child]`, reroute: `${source}[child]`});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
            changes.push({source: `${reroute}[adult]`, target: `${entrance}[adult]`, reroute: `${source}[adult]`});
            exit_binding[edgeThere] = edgeBack;
            exit_binding[edgeBack] = edgeThere;
            StateStorage.writeExtra("exits", edgeThere, edgeBack);
        } else {
            if (!!exit_binding[edgeThere]) {
                StateStorage.writeExtra("exits", exit_binding[edgeThere], "");
            }
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: "[child]"});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: "[adult]"});
            exit_binding[edgeThere] = "";
        }
    }
}

// register event on state change
EventBus.register("state", event => {
    Logic.clearTranslations("region.root");
    const changes = [];
    if (event.data.extra.exits != null) {
        for (const edgeThere in event.data.extra.exits) {
            if (!edgeThere) continue;
            const edgeBack = event.data.extra.exits[edgeThere];
            applyEntranceChanges(changes, edgeThere, edgeBack);
        }
    }
    if (!!changes.length) {
        const res = Logic.setTranslation(changes, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
    }
});

// register event on exit target change
EventBus.register("statechange_exits", event => {
    const changes = [];
    for (const edgeThere in event.data) {
        if (!edgeThere) continue;
        const edgeBack = event.data[edgeThere].newValue;
        applyEntranceChanges(changes, edgeThere, edgeBack);
    }
    if (!!changes.length) {
        const res = Logic.setTranslation(changes, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
    }
});

// register event for (de-)activate entrances
EventBus.register("randomizer_options", event => {
    let changed = false;
    for (const key in OPTIONS) {
        if (event.data.hasOwnProperty(key) && OPTIONS[key] != event.data[key]) {
            OPTIONS[key] = event.data[key];
            changed = true;
        }
    }
    if (changed) {
        update();
    }
});

async function update() {
    const changes = [];
    for (const exit in exit_binding) {
        if (!exit) continue;
        const exitEntry = ExitRegistry.get(exit);
        if (exitEntry != null) {
            const [source, target] = exit.split(" -> ");
            if (exitEntry.active()) {
                const reroute = exit_binding[exit].split(" -> ")[0];
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
            } else {
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${target}[child]`});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${target}[adult]`});
            }
        } else {
            throw Error("Entrance association error: data may be stale");
        }
    }
    if (!!changes.length) {
        const res = Logic.setTranslation(changes, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
        }
    }
}

class AugmentExits {

    async init() {
        const exits = StateStorage.readAllExtra("exits");
        for (const exit in exits) {
            exit_binding[exit] = exits[exit]
        }
        for (const key in OPTIONS) {
            OPTIONS[key] = StateStorage.read(key);
        }
        await update();
    }

}

export default new AugmentExits();