#!/usr/bin/env python

import websockets
import json
import blender
#import atlasing
import asyncio


# coroutine with the connection as argument.
# one handler for each client.
async def handler(websocket):

    print("New client connected.")

    # create Application instance?!

    async for message in websocket:

        print(message)

        #  FileNotFoundError: [Errno 2] No such file or directory: '../../BlenderSimulation/Test_Json/Test.json'
        with open('../../BlenderSimulation/Test_Json/JsonForBlender.json', 'w') as outfile:
            outfile.write(message)

        blender.startBlender()
        atlasing.startAtlasing()

        with open('../../BlenderSimulation/Test_Json/Send.json', "r") as matrices:
            data = json.load(matrices)
            await websocket.send(json.dumps(data))


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