import FileSystem from "/deepJS/util/FileSystem.js";
import GlobalData from "/deepJS/storage/GlobalData.js";

document.getElementById("layouteditor-menu-file-exit").onclick = exitEditor;

function exitEditor() {
    document.getElementById('view-pager').setAttribute("active", "main");
}

