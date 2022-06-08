#!/usr/bin/env python

import websockets
import json
import blender
import asyncio


# coroutine with the connection as argument.
# one handler for each client.
async def handler(websocket):

    print("New client connected.")

    # create Application instance?!

    async for message in websocket:

        # 'Okay' vom Client, die Simulation zu beginnen -> Szene ist final

        # JSON 'Drehbuch' abfangen
        # Prototype: Nur Startposition des Feuers
        # sceneInformation has JSONFile as String
        # sceneInformation = json.loads(message)

        print(message)

        # @Todo throws an exception for a second request:
        #  FileNotFoundError: [Errno 2] No such file or directory: '../../BlenderSimulation/Test_Json/Test.json'
        with open('../../BlenderSimulation/Test_Json/Test.json', 'w') as outfile:
            outfile.write(message)

        blender.startBlender()

        websocket.send()


# coroutine which waits for a client to connect.
# main() only exists once.
async def main():
    # websockets.serve(  coroutine that manages a connection,
    #                   network interfaces where the server can be reached,
    #                   port on which the server listens )
    async with websockets.serve(handler, "", 8001):
        print("Waiting for new client to connect.")
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    print("Start websocket server.")
    #asyncio.run(handler())
    asyncio.run(main())