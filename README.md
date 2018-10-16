# Gravitational Voronoi

This repository contains the architect code for Gravitational Voronoi. It consists of a game server, a sample client, and a web visualization interface that displays the game progress in real time.

## Dependencies

1. Python 3.6+
    1. pyrebase (pip install pyrebase)
2. Node.js / yarn (if you want to display games on browser)

## The server

The server is written in Python 3. To run the server execute:

```
python3 voronoi_game.py <number-of-stones> <number-of-players> <host-ip> <port> [<use-graphics>]
```

The last command line argument `<use-graphics>` is optional and graphics is only activated if you pass a `1` for this argument.

Also note that ports `10000` and `8080` are reserved for the web interface and socket server, so please use some other port. After all clients have connected, press `<Enter>` to start the game.

The server calculates the area of influence of each player discretely on a 1000 by 1000 grid. The final score of each player is the number of cells under the influence of that player.

## The client

In our implementation, player order is determined by the order in which each client connects to the server, i.e., the first client that connects to the server becomes the first player of the game. However, the play order (1-indexed) for each client will be sent upon successful connection.

In addition, player rotation after each game is built in, so that each player would play exactly one game as the first one to move. More details on how this works are included below.

A sample client in Python 3 is provided. To run the sample client, execute:

```
python3 voronoi_client.py <server-ip> <port> <team-name>
```

If you wish to write your own client, please follow the server-client communication protocol:

1. Connect your client to the server.

2. Receive game information. After connecting your client to the server, you should receive the game information from the server in JSON:
    ```
    {
        "num_players": 2,
        "num_stones": 10,
        "player_number": 1
    }
    ```
Player_number is your id that is assigned to you by the server.

3. Send your team name in the following JSON format:
    ```
    {
        "player_name": "Botty McBotFace"
    }
    ```
    Steps 1-3 only need to be completed once! Once all players are connected, the round begins. Your bot should now be listening for game updates.

4. Receive game updates. Your client will receive an update from the server when it is your turn, provided you haven't used up all of your time. It looks like:
    ```
    {
        "game_over": false,
        "remaining_time": 120.0,
        "scores": [35, 35, 30],
        "moves": [[1, 1, 1], [100, 100, 2]]
    }
    ```
   1. Game over flag, `true` if the game is over. 
   2. Your remaining time.
   3. Scores. Say there are N players. Then there will be an array of N numbers, representing the score from player 1 to player N.
   3. Moves. These are the moves that have been played after you played your last move. Each move consists of three numbers: the row of the move, the column of the move, and the player than made the move (1-indexed). The moves are ordered in the order in which they were played. *Note that if you are the first player to move, this array will be empty*

5. Send move to server. After receiving a game update from the server, your client should finish your turn by sending a move to the server. If you make an illegal move, it is ignored. The move should simply be a JSON object:
    ```
    {
        "move_row": 100,
        "move_col": 100
    }
    ```

6. When the game over flag is true, every client receives a game update message saying the current round has ended. *You do not need to complete steps `1-3` again!* Instead, client should reset itself and treat all future updates as updates for a new game. Note that if your client is going first, you will receive a game update message from the server in which the moves array is empty. After you receive such message, send your move to the server. It might be helpful to take a look at how the sample client handles rotation if you are still confused.

## Running the game without display (recommended for local testing)

To run the game without the display, run the game server with:

```
python3 voronoi_game.py <number-of-stones> <number-of-players> <host-ip> <port>
```

and run each client with (if you are using the client provided here):

```
python3 voronoi_client.py <server-ip> <port> <team-name>
```

Finally, press `<Enter>` in the server terminal to start the game/round when prompted.

## Running the game with display via sockets

First you must make sure you have `node.js` and `npm` installed. You also need relatively modern versions of both `node.js` and the browser you will be using for the display, though nothing bleeding edge is needed. But if you encounter any errors, you should always try upgrading your browser/`node.js` first.

First build the contents of the root folder:
```
cd Gravitational_Voronoi
npm install
```

Now, build the contents of the web/ folder with npm:

```
cd web/
npm install
npm run-script build
cd ..
```

Or, build with yarn (recommended):
```
cd web/
yarn install
yarn build
cd ..
```

Finally, to run the game with the display, first run the web server with:

```
node web.js
```

and then open `localhost:10000` in your browser and select the SocketIO option. You are now ready to run as many games as you want using basically the same approach as without a display. The only difference is to add a `1` to the server command from above like so:

```
python3 voronoi_game.py <number-of-stones> <number-of-players> <host-ip> <port> 1
```

Try not to refresh the page! At the moment, the board display will bug out.
Every time you start a new server, the board will reset on your display.

## Running the game with display via Firebase

If you're going down this route, I'm assuming you semi-know what you are doing... 
You should have (some?) experience in developing applications in firebase or at least be familiar with it.
This is the way the game was run during class.

1. Initialize a firebase project and config your Realtime Database rules to allow for unauthenticated reads and writes
2. Copy and paste your firebase credentials into a new file in web/src called config.js, it should look something like this:
```
const config = {
    apiKey: "...",
    authDomain: "...",
    databaseURL: "...",
    projectId: "...",
    storageBucket: "...",
    messagingSenderId: "..."
};

export default config;
```

3. Add a config.json file to the root folder containing the same credentials, it should look like this:
```
{
    "apiKey": "...",
    "authDomain": "...",
    "databaseURL": "...",
    "projectId": "...",
    "storageBucket": "...",
    "messagingSenderId": "..."
}
```

4. You will need to install an additional pip package, pyrebase: `pip install pyrebase`
5. Run the app and select the firebase option:
```
cd web/
yarn start
```

Finally, run the game server:
```
python3 voronoi_game.py <number-of-stones> <number-of-players> <host-ip> <port> 2
```

### Saving boards from display
If you wish to save the boards (artworks) from the games you play, you can right click to save the image