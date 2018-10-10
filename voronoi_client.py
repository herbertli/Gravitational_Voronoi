import socket
import time
import random
import sys
import math
import json


class Client:
    def __init__(self, host: str, port: int, name: str):
        self.host = host
        self.port = port
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.name = name

        # hard-coded game info
        self.grid_size = 1000
        self.min_dist = 66

        # connect to server and get game info
        self.sock.connect((host, port))

        game_state = self.__receive_game_state()
        self.num_players = game_state["num_players"]
        self.num_stone = game_state["num_stones"]
        self.player_number = game_state["player_number"]

        self.grid = [[0] * self.grid_size for i in range(self.grid_size)]
        self.moves = []  # store history of moves

        # send name to serer
        self.__send({
            "player_name": self.name
        })
        print("Client initialized")

    def __reset(self):
        self.grid = [[0] * self.grid_size for i in range(self.grid_size)]
        self.moves = []

    def __receive(self) -> object:
        return json.loads(self.sock.recv(4096).decode("utf-8"))

    def __send(self, obj: object):
        self.sock.sendall(json.dumps(obj).encode("utf-8"))

    def __receive_game_state(self) -> object:
        return self.__receive()

    def __send_move(self, move_row: int, move_col: int):
        self.__send({
            "move_row": move_row,
            "move_col": move_col
        })

    def __compute_distance(self, row1: int, col1: int, row2: int, col2: int) -> float:
        return math.sqrt((row2 - row1)**2 + (col2 - col1)**2)

    def __is_valid_move(self, move_row: int, move_col: int) -> bool:
        for move in self.moves:
            if (self.__compute_distance(move_row, move_col, move[0], move[1])) < self.min_dist:
                return False
        return True

    # your algorithm goes here
    # a naive random algorithm is provided as a placeholder
    def __getMove(self) -> (int, int):
        move_row = 0
        move_col = 0
        while True:
            move_row = random.randint(0, 999)
            move_col = random.randint(0, 999)
            if (self.__is_valid_move(move_row, move_col)):
                break
        # simulate thinking
        time.sleep(random.randint(1, 3))
        return move_row, move_col

    def start(self):
        for p in range(self.num_players):
            while True:
                game_state = self.__receive_game_state()
                # check if game is over
                if game_state["game_over"]:
                    print("Game over")
                    break

                # scores
                scores = game_state["scores"]
                # new moves
                new_moves = game_state["moves"]
                num_new_moves = int(len(new_moves) / 3)
                # sanity check
                if num_new_moves * 3 != len(new_moves):
                    print("Error: error parsing list of new moves")

                # insert new moves into the grid
                for i in range(num_new_moves):
                    move_row = int(new_moves[3 * i])
                    move_col = int(new_moves[3 * i + 1])
                    player = int(new_moves[3 * i + 2])
                    # sanity check, this should always be true
                    if player > 0:
                        self.grid[move_row][move_col] = player
                        self.moves.append((move_row, move_col, player))
                    else:
                        print("Error: player info incorrect")

                # make move
                my_move_row, my_move_col = self.__getMove()
                self.moves.append(
                    (my_move_row, my_move_col, self.player_number))
                self.__send_move(my_move_row, my_move_col)
                print("Played at row {}, col {}".format(
                    my_move_row, my_move_col))

        self.sock.close()


if __name__ == "__main__":
    host = sys.argv[1]
    port = int(sys.argv[2])
    name = sys.argv[3]
    # note: whoever connects to the server first plays first
    client = Client(host, port, name)
    client.start()
