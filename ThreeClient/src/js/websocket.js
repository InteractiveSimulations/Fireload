let websocket;

function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

function receiveSimulation( data ) {
        const event = JSON.parse(data);
}

function startSimulation( json ) {
    // When clicking a column, send a "play" event for a move in that column.

    websocket.send(json);
}

window.addEventListener("DOMContentLoaded", () => {

    // Open the WebSocket connection and register event handlers.
    websocket = new WebSocket("ws://localhost:8001/");
    receiveSimulation();

    websocket.addEventListener("message", receiveSimulation );

});