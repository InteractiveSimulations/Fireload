export let websocket;

function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

function receiveSimulation( data ) {
        const event = JSON.parse(data);
}

export function startSimulation( json ) {
    websocket.send(json);
    console.log(json);
}

window.addEventListener("DOMContentLoaded", () => {

    // Open the WebSocket connection and register event handlers.
    websocket = new WebSocket("ws://localhost:8001/");

    websocket.addEventListener("message", receiveSimulation );
});