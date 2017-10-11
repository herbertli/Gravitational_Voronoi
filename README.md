# Gravitational Voronoi

This repository contains the architect code for Gravitational Voronoi. It consists of a game server, a sample client, and a web visualization interface that displays the game progress in real time (not complete).

## The server

The server is written in Python 3. To run the server, execute:

```
python3 voronoi_game.py <number-of-stones> <number-of-players> <host-ip> <port>
```

Note that ports 10000 and 8080 are reserved for the web interface, so please use some other port. After all clients have connected, press `<Enter>` to start the game.

The server calculates the area of influence of each player discretely on a 1000 by 1000 grid. The final score of each player is the number of cells under the influence of that player.

## The client

In our implementation, there is no flag that indicates which client is the first (or second) player. Rather, player order is determined by the order in which each client connects to the server, i.e., the first client that connects to the server becomes the first player of the game.

A sample client in Python (also 3) is provided. Before running the client, we recommend that you change the name of your client to your team name in the client main routine. To run the sample client, execute:

```
python3 voronoi_client.py <server-ip> <port>
```

If you wish to write your own client, please follow the server-client communication protocol:

1. Connect to server. Your client should connect to the server by sending your team name as a string to the server.

2. Receive game information. After every client has successfully connected to the server, the server sends out a string `"<number-of-players> <number-of-stones>"` to each client. The string is delimited by a space.

3. Receive game updates. After the initial broadcast, a client will only receive a game update message from the server when it is that client's turn. The game update message is again a string delimited by spaces. The first entry indicates if the game is over (`0` for game over, `1` otherwise). The second entry indicates the number of moves that have been played so far, counting all players. Finally, the moves themselves appear at the end of the string, and each move is represented by 3 entries - the row of the move, the column of the move, and the player that plays that move.

```
"<game-over> <number-of-moves-so-far> <move1-row> <move1-col> <move1-player> <move2-row> <move2-col> <move2-player> ..."
```

Note: for each move, the move row and move column is 0-indexed, while the move player is 1-indexed.

4. Send move to server. After receiving an update from the server, the client should send a move to the server if the game is not over yet. The move is simply a string `"<move_row> <move_col>"` - row and column of the move separated by a space.

## Running the game without display

To run the game without the display, simply run the server with:

```
python3 voronoi_game.py <number-of-stones> <number-of-players> <host-ip> <port>
```

and run each client with:

```
python3 voronoi_client.py <server-ip> <port>
```

or run your client.

Finally, press `<Enter>` in the server terminal to start the game.

## Running the game with display

To be finished
