import FileData from "/emcJS/storage/FileData.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/logic/Logic.js";
import WorldRegistry from "../WorldRegistry.js";

class ListLogic {
    
    check(list) {
        let world = FileData.get("world/marker");
        let res = {
            done: 0,
            unopened: 0,
            reachable: 0,
            value: 0
        };
        if (!!list && Array.isArray(list)) {
            for (let entry of list) {
                const category = entry.category;
                const id = entry.id;
                let buffer = world[category][id];
                if (category == "location") {
                    let access = buffer.access;
                    if (!StateStorage.read(id, 0)) {
                        res.unopened++;
                        if (Logic.getValue(access)) {
                            res.reachable++;
                        }
                    } else {
                        res.done++;
                    }
                }
                if (category == "subarea") {
                    const subarea = FileData.get(`world/subarea/${id}/list`).filter(this.filterUnusedChecks);
                    const {done, unopened, reachable} = this.check(subarea);
                    res.done += done;
                    res.unopened += unopened;
                    res.reachable += reachable;
                }
                if (category == "subexit") {
                    const subexit = FileData.get(`world/marker/subexit/${id}`);
                    const bound = StateStorage.readExtra("subexits", subexit.access);
                    let entrance = FileData.get(`world/exit/${bound}`);
                    if (entrance == null) {
                        entrance = FileData.get(`world/exit/${bound.split(" -> ").reverse().join(" -> ")}`)
                    }
                    if (bound != null) {
                        const subarea = FileData.get(`world/${entrance.area}/list`).filter(this.filterUnusedChecks);
                        const {done, unopened, reachable} = this.check(subarea);
                        res.done += done;
                        res.unopened += unopened;
                        res.reachable += reachable;
                    }
                }
            }
        }
        if (res.unopened > 0) {
            if (res.reachable > 0) {
                if (res.unopened == res.reachable) {
                    res.value = 3;
                } else {   
                    res.value = 2;
                }
            } else {
                res.value = 1;
            }
        }
        return res;
    }

    filterUnusedChecks(check) {
        const loc = WorldRegistry.get(`${check.category}/${check.id}`);
        return !!loc && loc.visible();
    }

}

export default new ListLogic();