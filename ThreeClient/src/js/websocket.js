export let websocket;
<<<<<<< HEAD
export let simStatus;
=======
>>>>>>> 9b38d0d00f9416e6602f6f36c5496109a7d40b3f

function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

<<<<<<< HEAD
// @Todo the client probably only receives a message that the simulation ist ready to download and the download link
function receiveSimulationStatus( message ) {

    const json = JSON.parse(message.data);
    console.log(message.data);
    console.log( json.simStatus );

=======
function receiveSimulation( data ) {
    const event = JSON.parse(data);
>>>>>>> 9b38d0d00f9416e6602f6f36c5496109a7d40b3f
}

/**
 * Requests a simulation.
<<<<<<< HEAD
 * @param {object} json - json data which represents the scenes current state and the simulation script.
=======
 * @param {string} json - json string which represents the scenes current state and the simulation script.
>>>>>>> 9b38d0d00f9416e6602f6f36c5496109a7d40b3f
 */
export function requestSimulation( json ) {

    try {
<<<<<<< HEAD
        websocket.send( JSON.stringify(json, null, 2) );
=======
        websocket.send(json);
>>>>>>> 9b38d0d00f9416e6602f6f36c5496109a7d40b3f
    }
    catch (err) {
        // @Todo inform client via GUI that the connection isn't established
        // InvalidStateError DOMException
        // Thrown if WebSocket.readyState is CONNECTING.
<<<<<<< HEAD
        showMessage( "websocket connection not established.");
=======
        showMessage( "websocket connection not established.")
>>>>>>> 9b38d0d00f9416e6602f6f36c5496109a7d40b3f
    }

}

// sessionHandling or better inform the client, that the server closed the connection
function sessionHandling() {}

window.addEventListener("DOMContentLoaded", () => {

    // Open the WebSocket connection and register event handlers.
    websocket = new WebSocket("ws://localhost:8001/");
<<<<<<< HEAD

    websocket.onmessage = receiveSimulationStatus;
    websocket.onclose   = sessionHandling;
=======
    receiveSimulation();

    websocket.addEventListener( "message",  receiveSimulation );
    websocket.addEventListener( "close",    sessionHandling   );

    // websocket.onmessage = receiveSimulation
    // websocket.onclose   = sessionHandling
>>>>>>> 9b38d0d00f9416e6602f6f36c5496109a7d40b3f

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
