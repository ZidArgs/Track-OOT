import DeepMessageBuffer from "./MessageBuffer.mjs";

const SEC = window.location.protocol == "https:";
const EMPTY_FN = function() {};

const CLIENT = new WeakMap();
const TIMEOUT = new WeakMap();
const MESSAGE_BUFFER = new WeakMap();
const READY_AWAIT = new WeakMap();

const ON_ICE = new WeakMap();
const ON_OFFER = new WeakMap();
const ON_ANSWER = new WeakMap();

const pingOut = 3000;

export default class DeepSigClient {

    constructor(url) {
        if (typeof url != "string") {
            let port = parseInt(url);
            if (isNaN(port) || port < 0x0400 || port > 0xFFFF) {
                url = window.location.hostname;
            } else {
                url = `${window.location.hostname}:${port}`;
            }
        }
        let client = new WebSocket(`ws${SEC?"s":""}://${url}/signaling`);
        MESSAGE_BUFFER.set(this, new DeepMessageBuffer());
        READY_AWAIT.set(this, []);
        ON_ICE.set(this, EMPTY_FN);
        ON_OFFER.set(this, EMPTY_FN);
        ON_ANSWER.set(this, EMPTY_FN);
        client.addEventListener('open', function() {
            CLIENT.set(this, client);
            clearTimeout(TIMEOUT.get(this));
            TIMEOUT.set(this, setTimeout(client.close, pingOut));
            MESSAGE_BUFFER.get(this).each(client.send);
        }.bind(this));
        client.addEventListener('close', function() {
            CLIENT.delete(this);
            clearTimeout(TIMEOUT.get(this));
            TIMEOUT.delete(this);
        }.bind(this));
        client.addEventListener('message', function(event) {
            let msg = JSON.parse(event.data);
            switch(msg.type) {
                case "ping":
                    clearTimeout(TIMEOUT.get(this));
                    TIMEOUT.set(this, setTimeout(client.close, pingOut));
                    CLIENT.get(this).send(JSON.stringify({type:"pong",time:msg.time}));
                break;
                case "uuid":
                    this.UUID = msg.body;
                    READY_AWAIT.get(this).forEach(function(fn) {
                        fn(true);
                    });
                    READY_AWAIT.delete(this);
                break;
                case "sdp":
                    if (msg.body.type == "offer") {
                        ON_OFFER.get(this)(msg.sender, msg.body);
                    } else if (msg.body.type == "answer") {
                        ON_ANSWER.get(this)(msg.sender, msg.body);
                    }
                break;
                case "ice":
                    ON_ICE.get(this)(msg.sender, msg.body);
                break;
            }
        }.bind(this));
    }

    close() {
        CLIENT.get(this).close();
    }

    sendICE(reciever, data) {
        let msg = JSON.stringify({
            type: 'ice',
            reciever: reciever,
            body: data
        });
        if (CLIENT.has(this)) {
            CLIENT.get(this).send(msg);
        } else {
            MESSAGE_BUFFER.get(this).add(msg);
        }
    }

    sendSDP(reciever, data) {
        let msg = JSON.stringify({
            type: 'sdp',
            reciever: reciever,
            body: data
        });
        if (CLIENT.has(this)) {
            CLIENT.get(this).send(msg);
        } else {
            MESSAGE_BUFFER.get(this).add(msg);
        }
    }

    isReady() {
        return new Promise(function(resolve) {
            if (READY_AWAIT.has(this)) {
                READY_AWAIT.get(this).push(resolve);
            } else {
                resolve(true);
            }
        }.bind(this));
    }

    set onice(value) {
        if (typeof value == "function") {
            ON_ICE.set(this, value);
        } else {
            ON_ICE.set(this, EMPTY_FN);
        }
    }

    set onoffer(value) {
        if (typeof value == "function") {
            ON_OFFER.set(this, value);
        } else {
            ON_OFFER.set(this, EMPTY_FN);
        }
    }

    set onanswer(value) {
        if (typeof value == "function") {
            ON_ANSWER.set(this, value);
        } else {
            ON_ANSWER.set(this, EMPTY_FN);
        }
    }

}