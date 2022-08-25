export let websocket;
export let simStatus;
import * as SCRIPT from './script'
import * as LOADER from './Loader'

// informs the client, that the websocket connection couldn't be established
function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

/**
 * Sets the simulation data and informs the client that the simulation is ready to be downloaded.
 * @param {object} message - json data which represents simulation data.
 */
function receiveSimulationStatus( message ) {

    const json = JSON.parse(message.data);

    // set matrices of simulation capture cameras
    SCRIPT.setMatrices( json.modelViewMats, json.projectionMats );

    // notification for the client that the simulation can be started
    SCRIPT.createTextAnimation();

    // filename strings for simulation atlases
    LOADER.atlasFilenames = json.atlasFilenames;

}

/**
 * Requests a simulation.
 * @param {object} json - json data which represents the scenes current state and the simulation parameters.
 */
export function requestSimulation( json ) {

    try {
        websocket.send( JSON.stringify(json, null, 2) );
    }
    catch (err) {
        showMessage( "websocket connection not established.");
    }

}

// establish the websocket connection when DOM content is loaded.
window.addEventListener("DOMContentLoaded", () => {

    // open the WebSocket connection and register event handlers.
    websocket = new WebSocket("ws://localhost:8001/");

    websocket.onmessage = receiveSimulationStatus;

});