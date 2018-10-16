from voronoi_server import VoronoiServer

import time
import sys
import math
import socket
import json
import zlib

class VoronoiGame:
    def __init__(self, num_stones: int, num_players: int, grid_size: int, min_dist: int, host: str, port: int, use_graphic: bool, use_firebase: bool):
        # game variables
        self.num_stones = num_stones
        self.num_players = num_players

        # set up 1000x1000 grid
        self.grid_size = grid_size
        self.grid = [[0] * grid_size for i in range(grid_size)]
        self.score_grid = [[0] * grid_size for i in range(grid_size)]
        
        # minimum distance allowed between stoens
        self.min_dist = min_dist  
        
        # player scores and times and # moves/turns they have had (including invalid)
        self.scores = [0] * num_players
        self.player_times = [120.0] * num_players
        self.moves_made = [0] * num_players
        
        # store moves played
        # each move corresponds is a list of 3 numbers
        self.moves = []
        
        # gravitational pull, pull[i] is 2d-array of the pull player i has in total
        self.pull = []
        for i in range(num_players):
            self.pull.append([[0] * grid_size for j in range(grid_size)])
        
        # first player to connect goes first
        self.current_player = 0
        
        # flag
        self.game_over = False

        # use epsilon to handle floating-point comparisons
        self.epsilon = 1e-9

        # server that communicates to client
        self.server = VoronoiServer(host, port, num_players)

        # socket connection to web front end (udp)
        self.use_graphic = use_graphic
        self.graphic_socket = None
        if use_graphic:
            self.graphic_socket = socket.socket(
                socket.AF_INET, socket.SOCK_STREAM)
            self.graphic_socket.connect(('localhost', 8080))
        
        # if using firebase, open a connection to the realtime-database
        self.use_firebase = use_firebase
        if use_firebase:
            try:
                import pyrebase
            except ImportError:
                print("Please 'pip install pyrebase'.")
                sys.exit(1)
            with open('config.json') as f:
                config = json.load(f)
                firebase = pyrebase.initialize_app(config)
                self.db = firebase.database()

    # reset game after a round
    def __reset(self):
        self.grid = [[0] * self.grid_size for i in range(self.grid_size)]
        self.score_grid = [[0] * self.grid_size for i in range(self.grid_size)]
        self.scores = [0] * num_players
        self.player_times = [120.0] * num_players
        self.moves = []
        self.pull = []
        for i in range(num_players):
            self.pull.append(
                [[0] * self.grid_size for j in range(self.grid_size)])
        self.moves_made = [0] * num_players
        self.game_over = False

    # create an object representing the state of the game, send to client
    def __get_game_state(self):
        game_info = {}
        
        # game over flag
        game_info["game_over"] = self.game_over
        
        # scores
        game_info["scores"] = self.scores
        
        # new moves - go through move history in reverse order and stop when a move by current player is found
        # this gets the "new moves" for the current player
        # note that self.moves[i][2] stores the 1-indexed id of the player who made that move
        # self.current_player is 0-indexed which is why we check self.current_player + 1
        new_moves = []
        for i in range(len(self.moves) - 1, -1, -1):
            if (self.moves[i][2] == self.current_player + 1):
                break
            new_moves.append(self.moves[i])
        game_info["moves"] = new_moves

        # and give them their remaining calculation time
        game_info["remaining_time"] = self.player_times[self.current_player]
        return game_info

    # send game info to current player,
    # or if the game is over, broadcast to everyone
    def __broadcast_game_info(self):
        game_info = self.__get_game_state()
        if self.game_over:
            for i in range(num_players):
                self.server.send(game_info, i)
        else:
            print("Sending:", game_info, "to:", self.current_player)
            self.server.send(game_info, self.current_player)

    # compresses grid
    def __generate_compressed_game_bitmap(self) -> str:
        # Compression format is start_index end_index (inclusive) player_owner
        bitmap = ''
        for score_row in self.score_grid:
            bitmap += '0 '
            for i in range(1, len(score_row)):
                if score_row[i] != score_row[i-1]:
                    # End this compression range and start the next one
                    bitmap += '{} {} {} '.format(str(i - 1),
                                                 str(score_row[i-1]), str(i))
            # End the final range
            bitmap += '{} {} '.format(str(len(score_row) - 1),
                                      str(score_row[-1]))
        return bitmap

    # This was just written for testing correct (de)compression
    def __generate_decompressed_game_bitmap(self, compressed_bitmap: str) -> str:
        i = 0
        compressed_bitmap_array = compressed_bitmap.split(' ')
        decompressed_bitmap = ''
        for j in range(0, 10**7, 3):
            decompressed_bitmap += (compressed_bitmap_array[j + 2] + ' ') * (
                int(compressed_bitmap_array[j + 1]) - int(compressed_bitmap_array[j]) + 1)
            if compressed_bitmap_array[j + 1] == '999':
                i += 1
                if i == 1000:
                    break
        return decompressed_bitmap
    
    # send the game state to firebase
    def __send_update_to_fb(self, move_row=False, move_col=False, soft_reset=False):
        data = {}
        data["bitmap"] = self.__generate_compressed_game_bitmap()
        # Add rest of meta data
        data["player_times"] = self.player_times
        data["player_scores"] = self.scores
        data["num_players"] = self.num_players
        data["current_player"] = self.current_player + 1
        if move_row and move_col:
            data["move_row"] = move_row
            data["move_col"] = move_col
        data["player_names"] = self.server.names
        data["game_over"] = self.game_over
        data["soft-reset"] = soft_reset
        self.db.child("gameState").update(data)

    # sends game state to node.js graphic server, which sends it to the web front-end
    # via socket.io
    def __send_update_to_node(self, move_row=False, move_col=False, soft_reset=False):
        data = {}
        data["bitmap"] = self.__generate_compressed_game_bitmap()
        # Add rest of meta data
        data["player_times"] = self.player_times
        data["player_scores"] = self.scores
        data["num_players"] = self.num_players
        data["current_player"] = self.current_player + 1
        if move_row and move_col:
            data["move_row"] = move_row
            data["move_col"] = move_col
        data["player_names"] = self.server.names
        data["game_over"] = self.game_over
        data["soft-reset"] = soft_reset
        # do some compression on the object (I think this helps with the lag between servers)
        self.graphic_socket.sendall(zlib.compress(bytearray(json.dumps(data), "utf-8")))

    # sends a reset signal after a round ends
    def __soft_reset_node(self):
        self.__send_update_to_node(soft_reset=True)
    
    def __soft_reset_fb(self):
        self.__send_update_to_fb(soft_reset=True)

    # used for checking whether a move is valid
    def __compute_distance(self, row1: int, col1: int, row2: int, col2: int) -> float:
        return math.sqrt((row2 - row1)**2 + (col2 - col1)**2)

    # actually checks to see whether a move is valid
    def __is_legal_move(self, row: int, col: int) -> bool:
        if self.grid[row][col] != 0:
            print("({}, {}) is already occupied".format(row, col))
            return False
        if row < 0 or row >= self.grid_size:
            print("({}, {}) is out of bounds".format(row, col))
            return False
        if col < 0 or col >= self.grid_size:
            print("({}, {}) is out of bounds".format(row, col))
            return False
        # check for min dist requirement
        for move_start in range(len(self.moves)):
            move_row = self.moves[move_start][0]
            move_col = self.moves[move_start][1]
            if (self.__compute_distance(row, col, move_row, move_col) < self.min_dist):
                print("({}, {}) is less than 66 unit distances away from ({}, {})".format(
                    row, col, move_row, move_col))
                return False
        return True

    # gets a move from a player, and updates their time remaining
    def __get_player_move(self):
        player_name = self.server.names[self.current_player]
        player_time = self.player_times[self.current_player]
        print("Waiting for {}".format(player_name))
        print("They have {} seconds remaining...".format(player_time))
        start_time = time.time()
        client_response = self.server.receive(self.current_player)
        end_time = time.time()
        self.player_times[self.current_player] -= (end_time - start_time)
        return int(client_response["move_row"]), int(client_response["move_col"])

    # calculates the score of each player
    def __update_scores(self, move_row: int, move_col: int):
        tie_created = 0
        tie_broken = 0
        # note: score ignores stones, because each player has the same number of stones
        for row in range(self.grid_size):
            for col in range(self.grid_size):
                # avoid division by 0
                if (row == move_row and col == move_col):
                    continue
                # update current player's pull
                d = self.__compute_distance(row, col, move_row, move_col)
                self.pull[self.current_player][row][col] += float(
                    float(1) / (d*d))

                # first move claims every cell on the grid
                if sum(self.moves_made) == 1:
                    self.score_grid[row][col] = self.current_player + 1
                    self.scores[self.current_player] += 1
                # not first move
                else:
                    old_occupier = self.score_grid[row][col]
                    current_player_pull = self.pull[self.current_player][row][col]
                    # tie: multiple players had equal pull on the cell
                    if old_occupier == 0:
                        # check if current player's pull is now bigger than everyone else's
                        current_player_has_max_pull = True
                        for p in range(self.num_players):
                            if p != self.current_player and self.pull[p][row][col] > current_player_pull - self.epsilon:
                                current_player_has_max_pull = False
                                break
                        # tie broken
                        if (current_player_has_max_pull):
                            self.score_grid[row][col] = self.current_player + 1
                            self.scores[self.current_player] += 1
                            tie_broken += 1
                    # no tie, and cell is claimed by some other player
                    elif old_occupier - 1 != self.current_player:
                        old_occupier_pull = self.pull[old_occupier - 1][row][col]
                        # current player and old player have equal pull, then cell is not owned by anyone
                        if abs(current_player_pull - old_occupier_pull) <= self.epsilon:
                            self.score_grid[row][col] = 0
                            self.scores[old_occupier - 1] -= 1
                            tie_created += 1
                        # current player now has a greater pull, change owner to current player
                        elif current_player_pull > old_occupier_pull:
                            self.score_grid[row][col] = self.current_player + 1
                            self.scores[old_occupier - 1] -= 1
                            self.scores[self.current_player] += 1

        print("This move broke {} ties and created {} new ties\n".format(
            tie_broken, tie_created))

    # print winner message at the end of every round
    def __declare_winner(self):
        max_score = -1
        winners = []
        for i in range(self.num_players):
            player_name = self.server.names[i]
            player_score = self.scores[i]
            print("{} score: {}".format(player_name, player_score))

            if player_score == max_score:
                winners.append(i + 1)
            elif player_score > max_score:
                max_score = player_score
                winners = [i + 1]

        # handle case where there is a tie (highley unlikely)
        if len(winners) == 1:
            print("\nWinner: {}".format(self.server.names[winners[0] - 1]))
        else:
            print("Tied between: ")
            for winner in winners:
                print(" ".join([self.server.names[w - 1] for w in winners]))

    # main game logic
    def start(self):
        # get connections all clients
        self.server.establish_connection(self.num_players, self.num_stones)
        input("Press <Enter> to Start!")
        # send initial state
        if self.use_graphic:
            self.__send_update_to_node()
        if self.use_firebase:
            self.__send_update_to_fb()
        # if there are n players, we play n games, each player gets a chance going 1st
        for p in range(self.num_players):
            self.current_player = p
            while True:
                # current_player is 0-indexed
                self.current_player = self.current_player % self.num_players
                
                # if it's game_over, broadcast game over state to all players, re-loop
                if self.game_over:
                    self.__broadcast_game_info()
                    break
                
                # current player has run out of time, still we increment their turns
                if self.player_times[self.current_player] <= 0:
                    print("Player", self.current_player + 1, "has run out of time.")
                    self.moves_made[self.current_player] += 1
                    self.current_player += 1
                    continue

                # send game state to current_player, 
                # indicating they're on the clock to make a move
                self.__broadcast_game_info()
                move_row, move_col = self.__get_player_move()
                print("{} has placed their stone on: {}, {}".format(
                    self.server.names[self.current_player], move_row, move_col))
                self.moves_made[self.current_player] += 1
                
                # check if legal or not
                # in any case, increment current_player's move counter
                # also, handle case where they took too long...
                # if so, we shouldn't accept their move
                if not self.__is_legal_move(move_row, move_col):
                    print("Move is illegal, ignoring the current player")
                elif self.player_times[self.current_player] < 0:
                    print("Player", self.current_player + 1, "has run out of time making their move.")
                else:
                    # move is legal, do some book-keeping
                    self.grid[move_row][move_col] = self.current_player + 1
                    self.moves.append(
                        [move_row, move_col, self.current_player + 1])
                    self.__update_scores(move_row, move_col)
                
                # if I've made all my moves, the game is over for me!
                if self.moves_made[self.current_player] == self.num_stones:
                    self.player_times[self.current_player] = 0

                # send updated game state to front-end
                if self.use_graphic:
                    self.__send_update_to_node(move_row=move_row, move_col=move_col)
                if self.use_firebase:
                    self.__send_update_to_fb(move_row=move_row, move_col=move_col)

                # check for game over condition:
                # all players have made all their moves or all players have run out of time
                playersLeft = 0
                for i in range(self.num_players):
                    if self.player_times[i] > 0:
                        playersLeft += 1
                    elif self.moves_made[i] != self.num_stones:
                        playersLeft += 1
                # if there are no players remaining, game is over!
                if playersLeft == 0:
                    self.game_over = True

                # go to next player
                self.current_player += 1

            # if game is over, send message to front-end
            if self.use_graphic:
                self.graphic_socket.sendall(zlib.compress(bytearray(json.dumps({
                    "game_over": True
                }), "utf-8")))
            if self.use_firebase:
                self.db.child("gameState").update({
                    "game_over": True
                })
            self.__declare_winner()
            print("Game over")

            # reset unless it's the last game
            if p != num_players - 1:
                input("Press <Enter> to start next round")
                self.__reset()
                if self.use_graphic:
                    self.__soft_reset_node()
                if self.use_firebase:
                    self.__soft_reset_fb()


if __name__ == "__main__":
    GRID_SIZE = 1000
    MIN_DIST = 66
    if len(sys.argv) < 5:
        print("Usage: python3 voronoi_game.py <num_stones> <num_players> <host> <port> <use_graphics>")
        exit(0)
    num_stones = int(sys.argv[1])
    num_players = int(sys.argv[2])
    host = sys.argv[3]
    port = int(sys.argv[4])
    
    use_graphic = False
    if len(sys.argv) == 6 and int(sys.argv[5]) == 1:
        use_graphic = True

    use_firebase = False
    if len(sys.argv) == 6 and int(sys.argv[5]) == 2:
        use_firebase = True

    game = VoronoiGame(num_stones, num_players, GRID_SIZE,
                       MIN_DIST, host, port, use_graphic, use_firebase)
    game.start()
