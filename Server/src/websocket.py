#!/usr/bin/env python
"""websocket.py: Starts a websocket server which handles the exchange of simulation data and requests."""
__author__ = "Steffen-Sascha Stein, Nataliya Elchina"

import websockets
import json
import blender
import atlasing
import asyncio

# WebSocket for communication between server and client
# Connection is established if the server is running and the client connects to Port 8000
# The Coroutine has the connection as an argument
# One handler for each client
async def handler(websocket):

    print("New client connected.")

    async for message in websocket:

        # Message contains the JSON with the parameters of the client
        print(message)

        # Writing the message into the JSON for Blender, so Blender can create the requested fire of the client
        with open('../../BlenderSimulation/Test_Json/JsonForBlender.json', 'w') as outfile:
            outfile.write(message)

        # Starting the rendering and atlasing process
        blender.startBlender()
        atlasing.startAtlasing()

        # Sending matrices from Blender to the client
        with open('../../BlenderSimulation/Test_Json/Send.json', "r") as matrices:
            data = json.load(matrices)
            await websocket.send(json.dumps(data))


# coroutine which waits for a client to connect.
# main() only exists once.
async def main():
    # websockets.serve( coroutine that manages a connection,
    #                   network interfaces where the server can be reached,
    #                   port on which the server listens )
    async with websockets.serve(handler, "", 8001):
        print("Waiting for new client to connect.")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    print("Websocket server started on port 8001.")
    #asyncio.run(handler())
    asyncio.run(main())