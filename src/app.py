#!/usr/bin/env python

import asyncio
import python Blender API
import websockets
import itertools
import json
from connect4 import PLAYER1, PLAYER2, Connect4


# coroutine with the connection as argument.
# one handler for each client.
async def handler(websocket):

    print("New client connected.")

    # run blender
    game = Connect4()


    print("New game created.")

    # Players take alternate turns, using the same browser.
    turns = itertools.cycle([PLAYER1, PLAYER2])
    player = next(turns)

    async for message in websocket:



        # Parse a "play" event from the UI.
        event = json.loads(message)
        assert event["type"] == "play"
        column = event["column"]

        # Play the move
        try:
            row = game.play(player, column)
        except RuntimeError as exc:
            # Send an "error" event if the move was illegal.
            event = {
                "type": "error",
                "message": str(exc)
            }
            await websocket.send(json.dumps(event))
            continue

        # Send a "play" event to update the UI.
        event = {
            "type": "play",
            "player": player,
            "column": column,
            "row": row
        }
        await websocket.send(json.dumps(event))

        # If move is wining, send a "win" event.
        if game.winner is not None:
            event = {
                "type": "win",
                "player": game.winner
            }
            await websocket.send(json.dumps(event))

        print(message)
        print(event)

        # Alternate turns.
        player = next(turns)

    # async for message in websocket:
    #     print(message)
    #
    # # The code above is a shortcut for this behaviour:
    #
    # while True:
    #     try:
    #         message = await websocket.recv()
    #     except websockets.ConnectionClosedOK:
    #         break
    #     print(message)


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
    asyncio.run(main())
