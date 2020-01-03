import TrackerStorage from "/script/storage/TrackerStorage.js";
import StateConverter from "/script/storage/converters/StateConverter.js";

class StateManager {

    async rename(current, target) {
        let save = await TrackerStorage.StatesStorage.get(current);
        save.autosave = false;
        await TrackerStorage.StatesStorage.delete(current);
        await TrackerStorage.StatesStorage.set(target, save);
    }

    async delete(name) {
        await TrackerStorage.StatesStorage.delete(name);
    }

    async exists(name) {
        return await TrackerStorage.StatesStorage.has(name);
    }
    
    async getNames() {
        return await TrackerStorage.StatesStorage.keys();
    }
    
    async getStates() {
        return await TrackerStorage.StatesStorage.getAll();
    }

    async import(data) {
        data = StateConverter.convert(data);
        data.autosave = false;
        await TrackerStorage.StatesStorage.set(data.name, data);
    }

    async export(name) {
        return await TrackerStorage.StatesStorage.get(name, {});
    }
}

export default new StateManager;