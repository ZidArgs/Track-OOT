import Template from "/deepJS/util/Template.mjs";
import RATController from "/script/util/RATController.mjs";
import "./MultiplayerLobby.mjs";
import "./MultiplayerRoomClient.mjs";
import "./MultiplayerRoomMaster.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            flex: 1;
        }
        :host > * {
            flex: 1;
        }
        :host > :not(.active) {
            display: none;
        }
    </style>
    <ootrt-multiplayerlobby id="lobby_view" class="active"></ootrt-multiplayerlobby>
    <ootrt-multiplayerroommaster id="room_master"></ootrt-multiplayerroommaster>
    <ootrt-multiplayerroomclient id="room_client"></ootrt-multiplayerroomclient>
`);

class HTMLMultiplayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        
        let lobby_view = this.shadowRoot.getElementById("lobby_view");
        let room_master = this.shadowRoot.getElementById("room_master");
        let room_client = this.shadowRoot.getElementById("room_client");

        RATController.onroomupdate = function(data) {
            room_master.updateRoom(data);
            room_client.updateRoom(data);
        }

        lobby_view.addEventListener("host", function() {
            lobby_view.classList.remove("active");
            room_master.classList.add("active");
        });

        lobby_view.addEventListener("join", function() {
            lobby_view.classList.remove("active");
            room_client.classList.add("active");
        });

        room_master.addEventListener("close", function() {
            room_master.classList.remove("active");
            lobby_view.classList.add("active");
        });

        room_client.addEventListener("leave", function() {
            room_client.classList.remove("active");
            lobby_view.classList.add("active");
        });
    }

}

customElements.define('ootrt-multiplayer', HTMLMultiplayer);