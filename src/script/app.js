/*
    starting point for application
*/

import SettingsStorage from "/script/storage/SettingsStorage.js";
import GlobalData from "/script/storage/GlobalData.js";
import I18n from "/script/util/I18n.js";
import Logic from "/script/util/Logic.js";

import "/deepJS/ui/Paging.js";


(async function main() {

    updateLoadingMessage("load data...");
    await GlobalData.init();
    updateLoadingMessage("learn languages...");
    await I18n.load(await SettingsStorage.get("language", "en_us"));
    updateLoadingMessage("build logic data...");
    await Logic.loadLogic();
    updateLoadingMessage("poke application...");
    await $import.importModule("/deepJS/ui/Import.js");

}());