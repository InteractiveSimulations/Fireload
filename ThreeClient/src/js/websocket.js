export let websocket;
export let simStatus;


function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

// @Todo the client probably only receives a message that the simulation ist ready to download and the download link
function receiveSimulationStatus( message ) {

    const json = JSON.parse(message.data);
    console.log(message.data);
    console.log( json.simStatus );
}

/**
 * Requests a simulation.
 * @param {object} json - json data which represents the scenes current state and the simulation script.
 */
export function requestSimulation( json ) {

    try {
        websocket.send( JSON.stringify(json, null, 2) );
    }
    catch (err) {
        // @Todo inform client via GUI that the connection isn't established
        // InvalidStateError DOMException
        // Thrown if WebSocket.readyState is CONNECTING.
        showMessage( "websocket connection not established.");
    }

}

// sessionHandling or better inform the client, that the server closed the connection
function sessionHandling() {}

window.addEventListener("DOMContentLoaded", () => {

    // Open the WebSocket connection and register event handlers.
    websocket = new WebSocket("ws://localhost:8001/");

    websocket.onmessage = receiveSimulationStatus;
    websocket.onclose   = sessionHandling;


});

// Each WebSocket object has an associated ready state, which is a number representing the state of the connection.
// Initially it must be CONNECTING (0). It can have the following values:
//
// CONNECTING (numeric value 0)
// The connection has not yet been established.
//
// OPEN (numeric value 1)
// The WebSocket connection is established and communication is possible.
//
// CLOSING (numeric value 2)
// The connection is going through the closing handshake, or the close() method has been invoked.
//
// CLOSED (numeric value 3)
// The connection has been closed or could not be opened.