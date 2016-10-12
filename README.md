# Gravitational Voronoi

There are multiple ways to run the architect code. The instructions for doing so are given below:

## Running without Display

The files relevant to this mode are available in the `local` directory and they apply to both your local machine and on energon since there is no display. The game server is run by the command:


```
	python Voronoi_Game.py <Number of Stones>
```

And the random client by:

```
	python Voronoi_Client.py <Number of Stones>
```

If you want to test on energon, you may need to use:

```
	module load python-2.7
```

The game server will wait for two clients to connect before prompting the user to 'Press Enter'. Once the user complies, the game will commence. At the end, the server will echo the final scores of both players and announce the winner or tied winners in the exceptional case. 

The client `Voronoi_Client.py` implements a random algorithm to input the moves to the server. The input format is:

	`x y`

Where `x` and `y` are the coordinates of the board seperated by a space where the player wishes to place his stone. The server checks if the move is valid. In case of illegal moves, the game ends and the opponent is awarded with the win. Invalid moves include:

* `x` and `y` being outside the  grid
* Placing a stone on top of a previously placed stone
* Placing a stone within a euclidean distance of 66 to any other stone

For efficient socket communication, the server sends back only the moves made so far by each player. The client code has to reconstruct the grid (i.e. place all stones) each time. This is already done for you in the provided client (with negligible performance hit) so you can use that code. All ports and addresses are also hardcoded so all you need to do is write the algorithm and return the coordinates of where you want to place your stone for the current turn.

This method of running is efficient if you want to quickly assess the performance and accuracy of your algorithm.

## Running with Display on Localhost

You run the `local` files as mentioned before but to run the display you perform the following additional steps:

* Once you have started the game server and both clients have connected, before pressing the 'Enter' key, run:

```
	node web.js
```

You will need to have node installed on your machine. The socket.io package is already present in the directory. 

* Open a tab in your web browser to `localhost:10000`. At this point you should see the game screen with an empty grid.

* Now go back to your server code and press the 'Enter' key. The game should start and you should see the grid color appropriately after each successive move.

## Running with Display on Energon

To do this successfully, you need to do two important things:

* Obtain the local IP address of your system. You do this by running the provided `getLocalIp.py` script. If this yields `127.0.0.1`, then you need to find the IP using any alternative method.

* Place your game server and client code on energon2.

* Change the following lines in the files as detailed below:

	Voronoi_Game.py: line 181:

```
	- sock.sendto(message.encode('utf-8'), ('', 8080))
	+ sock.sentto(message.encode('utf-8'), (<local IP of your machine>, 8080))
```

You will run the game server and clients on energon2, and you will run `web.js` and the webpage `localhost:10000` on your machine. 