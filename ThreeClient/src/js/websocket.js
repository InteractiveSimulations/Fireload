export let websocket;
<<<<<<< HEAD
=======
export let simStatus;
>>>>>>> 5dca00fefc2669f7cd65339b54b8fdd95a04d936

function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

<<<<<<< HEAD
function receiveSimulation( data ) {
    const event = JSON.parse(data);
=======
// @Todo the client probably only receives a message that the simulation ist ready to download and the download link
function receiveSimulationStatus( message ) {

    const json = JSON.parse(message.data);
    console.log(message.data);
    console.log( json.simStatus );

>>>>>>> 5dca00fefc2669f7cd65339b54b8fdd95a04d936
}

/**
 * Requests a simulation.
<<<<<<< HEAD
 * @param {string} json - json string which represents the scenes current state and the simulation script.
=======
 * @param {object} json - json data which represents the scenes current state and the simulation script.
>>>>>>> 5dca00fefc2669f7cd65339b54b8fdd95a04d936
 */
export function requestSimulation( json ) {

    try {
<<<<<<< HEAD
        websocket.send(json);
=======
        websocket.send( JSON.stringify(json, null, 2) );
>>>>>>> 5dca00fefc2669f7cd65339b54b8fdd95a04d936
    }
    catch (err) {
        // @Todo inform client via GUI that the connection isn't established
        // InvalidStateError DOMException
        // Thrown if WebSocket.readyState is CONNECTING.
<<<<<<< HEAD
        showMessage( "websocket connection not established.")
=======
        showMessage( "websocket connection not established.");
>>>>>>> 5dca00fefc2669f7cd65339b54b8fdd95a04d936
    }

}

// sessionHandling or better inform the client, that the server closed the connection
function sessionHandling() {}

window.addEventListener("DOMContentLoaded", () => {

    // Open the WebSocket connection and register event handlers.
    websocket = new WebSocket("ws://localhost:8001/");
<<<<<<< HEAD
    receiveSimulation();

    websocket.addEventListener( "message",  receiveSimulation );
    websocket.addEventListener( "close",    sessionHandling   );

    // websocket.onmessage = receiveSimulation
    // websocket.onclose   = sessionHandling
=======

    websocket.onmessage = receiveSimulationStatus;
    websocket.onclose   = sessionHandling;
>>>>>>> 5dca00fefc2669f7cd65339b54b8fdd95a04d936

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
