from voronoi_server import VoronoiServer

import time, sys, math, socket

class VoronoiGame:
  def __init__(self, num_stones, num_players, grid_size, min_dist, port):
    # game variables
    self.num_stones = num_stones
    self.num_players = num_players
    self.grid_size = grid_size
    self.min_dist = min_dist # minimum distance allowed between stoens
    self.grid = [[0] * grid_size for i in range(grid_size)]
    self.score_grid = [[0] * grid_size for i in range(grid_size)]
    self.scores = [0] * num_players
    self.player_times = [120] * num_players
    # store moves played, each move corresponds to 3 entries
    self.moves = []
    # gravitational pull, pull[i] is 2d-array of the pull player i has in total
    self.pull = []
    for i in range(num_players):
      self.pull.append([[0] * grid_size for j in range(grid_size)])
    self.current_player = 0
    self.moves_made = 0
    self.game_over = False

    # server that communicates to client
    self.server = VoronoiServer('', port, num_players)
    # socket connection to web front end
    self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
  
  def __get_game_info(self):
    game_info = "1" if self.game_over else "0"
    game_info += " "
    game_info += str(int(len(self.moves) / 3))
    game_info += " "
    game_info += " ".join(str(i) for i in self.moves)
    return game_info

  def __broadcast_game_info(self):
    game_info = self.__get_game_info()
    if self.game_over:
      for i in range(num_players):
        self.server.send(game_info, i)
    else:
      self.server.send(game_info, self.current_player)

  def __send_update_to_node(self):
    # message = ""
    # for scoreList in scoreGrid:
    # message += " ".join(map(str, scoreList)) + " "
    # message += str(numberOfPlayers) + " " + str(currentTurn + 1) + " " + str(i) + " " + str(j)
    # # For some reason the previous architects decided to use UDP which has a 1500 byte sending limit
    # # so I'm just choosing to follow that and creating a work around. It's probably so that they didn't have to check if web.js was running and it could therefore work without graphical interface
    # sock.sendto('start'.encode('utf-8'), ('', 8080))
    # for i in range(0, len(message), 1000):
    #   sock.sendto(message[i:i+1000].encode('utf-8'), ('', 8080))
  
    # sock.sendto('end'.encode('utf-8'), ('', 8080))
    pass

  def __compute_distance(self, row1, col1, row2, col2):
    return math.sqrt((row2 - row1)**2 + (col2 - col1)**2)

  def __is_legal_move(self, row, col):
    if self.grid[row][col] != 0:
      return False
    if row < 0 or row >= self.grid_size:
      return False
    if col < 0 or col >= self.grid_size:
      return False
    # check for min dist requirement
    for move_start in range(0, len(self.moves), 3):
      move_row = self.moves[move_start]
      move_col = self.moves[move_start + 1]
      if (self.__compute_distance(row, col, move_row, move_col) <= self.min_dist):
        return False
    
    return True

  def __get_player_move(self):
    player_name = self.server.names[self.current_player]
    player_time = self.player_times[self.current_player]
    print("Waiting for {}".format(player_name))
    print("They have {} seconds remaining".format(player_time))
    
    start_time = time.time()
    client_response = self.server.receive(self.current_player)
    end_time = time.time()
    self.player_times[self.current_player] -= (end_time - start_time)

    data = client_response.split()
    return int(data[0]), int(data[1])

  def __update_scores(self, move_row, move_col):
    # note: score ignores stones, because each player has the same number of stones
    for row in range(self.grid_size):
      for col in range(self.grid_size):
        # avoid division by 0
        if (row == move_row and col == move_col):
          continue
        # update current player's pull
        d = self.__compute_distance(row, col, move_row, move_col)
        self.pull[self.current_player][row][col] += float(float(1) / (d*d))

        old_occupier = self.score_grid[row][col]
        # if the cell has not been claimed by any player
        if old_occupier == 0:
          self.score_grid[row][col] = self.current_player + 1
          self.scores[self.current_player] += 1
        # if the cell is claimed by some other player
        elif old_occupier - 1 != self.current_player:
          # and current player now has a greater pull
          if self.pull[self.current_player][row][col] > self.pull[old_occupier - 1][row][col]:
            self.score_grid[row][col] = self.current_player + 1
            self.scores[old_occupier - 1] -= 1
            self.scores[self.current_player] += 1
  
  def __declare_winner(self):
    max_score = -1
    winners = []
    for i in range(self.num_players):
      player_name = self.server.names[i]
      player_score = self.scores[i]
      if self.scores[i] == -1:
        print("Illegal move by {}".format(player_name))
      elif self.scores[i] == -2:
        print("{} timed out".format(player_name))
      else:
        print("{} score: {}".format(player_name, player_score))
      
      if player_score == max_score:
        winners.append(i + 1)
      elif player_score > max_score:
        max_score = player_score
        winners = [i + 1]

    if len(winners) == 1:
      print("\nWinner: {}".format(self.server.names[winners[0] - 1]))
    else:
      print("Tied between: ")
      for winner in winners:
        print(" ".join([self.server.names[w - 1] for w in winners]))
  
  def start(self):
    self.server.establish_connection(self.num_players, self.num_stones)
    self.sock.sendto('reset'.encode('utf-8'), ('', 8080))
    print('\nStarting...\n')

    while True:
      self.current_player = self.current_player % self.num_players
      self.__broadcast_game_info()
      if (self.game_over):
        break
      
      # get and validate move
      move_row, move_col = self.__get_player_move()
      print("{} has placed their stone on: {}, {}\n".format(self.server.names[self.current_player] , move_row, move_col))
      if not self.__is_legal_move(move_row, move_col):
        self.scores[self.current_player] = -1
        self.game_over = True
        continue
      
      # move is legal, do some book-keeping
      self.moves_made += 1
      self.grid[move_row][move_col] = self.current_player + 1
      self.moves.append(move_row)
      self.moves.append(move_col)
      self.moves.append(self.current_player + 1)
      self.__update_scores(move_row, move_col)

      # send data to node server
      self.__send_update_to_node()

      # check for game over conditions
      if self.player_times[self.current_player] < 0:
        self.scores[self.current_player] = -2
        self.game_over = True
      if self.moves_made == self.num_players * self.num_stones:
        self.game_over = True
      
      # switch player
      self.current_player += 1

    self.__declare_winner()
    print("\nGame over")

if __name__ == "__main__":
  GRID_SIZE = 1000
  MIN_DIST = 66
  num_stones = int(sys.argv[1])
  num_players = int(sys.argv[2])
  port = int(sys.argv[3])
  
  game = VoronoiGame(num_stones, num_players, GRID_SIZE, MIN_DIST, port)
  game.start()