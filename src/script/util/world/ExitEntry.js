import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";

function valueGetter(key) {
    return this.get(key);
}

const REF = new WeakMap();
const ACCESS = new WeakMap();
const TYPE = new WeakMap();
const ACTIVE = new WeakMap();

export default class ExitEntry {

    constructor(ref, data) {
        let active_logic = null;
        REF.set(this, ref);
        ACCESS.set(this, data.access);
        TYPE.set(this, data.type);

        /* LOGIC */
        if (typeof data.active == "object") {
            const stored_data = new Map(Object.entries(StateStorage.getAll()));
            active_logic = LogicCompiler.compile(data.active);
            ACTIVE.set(this, !!active_logic(valueGetter.bind(stored_data)));
        } else {
            ACTIVE.set(this, !!data.active);
        }

        /* EVENTS */
        const calculateFilter = function(data) {
            if (typeof active_logic == "function") {
                ACTIVE.set(this, !!active_logic(valueGetter.bind(data)));
            }
        }.bind(this);
        EventBus.register("state", event => {
            calculateFilter(new Map(Object.entries(event.data.state)));
        });
        EventBus.register("randomizer_options", event => {
            calculateFilter(new Map(Object.entries(event.data)));
        });
    }

    active() {
        return !!ACTIVE.get(this);
    }

    access() {
        return ACCESS.get(this);
    }

}