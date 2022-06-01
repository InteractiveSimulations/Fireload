let websocket;

function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

function receiveSimulation( data ) {
    const event = JSON.parse(data);
}

/**
 * Requests a simulation.
 * @param {string} json - json string which represents the scenes current state and the simulation script.
 */
function requestSimulation( json ) {

    try {
        websocket.send(json);
    }
    catch (err) {
        // @Todo inform client via GUI that the connection isn't established
        // InvalidStateError DOMException
        // Thrown if WebSocket.readyState is CONNECTING.
        showMessage( "websocket connection not established.")
    }

}

// sessionHandling or better inform the client, that the server closed the connection
function sessionHandling() {}

window.addEventListener("DOMContentLoaded", () => {

    // Open the WebSocket connection and register event handlers.
    websocket = new WebSocket("ws://localhost:8001/");
    receiveSimulation();

    websocket.addEventListener( "message",  receiveSimulation );
    websocket.addEventListener( "close",    sessionHandling   );

    // websocket.onmessage = receiveSimulation
    // websocket.onclose   = sessionHandling

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