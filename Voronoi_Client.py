import socket
import time
import random
import sys
import math

def euclideanDistance(x1, y1, x2, y2):
  distance = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
  return math.sqrt(distance)

HOST = sys.argv[1]
PORT = int(sys.argv[2])
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect((HOST, PORT))

# N == number of stones for the game
N, numberOfPlayers = map(int, s.recv(1024).split())
s.sendall("TEST_NAME".encode())

grid = [[0] * 1000 for item in range(0, 1000)]

while 1:
  serverResponse = s.recv(1024).decode('utf-8')
  data = serverResponse.split()

  # Check if the game has ended
  if int(data[0]) == 1:
    break


  # Construct the grid by placing all the moves so far
  numberOfMoves = int(data[1])
  moves = []
  for item in range(0, numberOfMoves):
    i = int(data[2 + item * 3])
    j = int(data[2 + item * 3 + 1])
    player = int(data[2 + item * 3 + 2])

    if player > 0:
      grid[i][j] = player
      moves.append((i, j, player))

  # Make a random valid move. Your algorithm goes here instead of the
  # following randomized move selection
  validMoveFound = False
  nextI = 0
  nextJ = 0

  while not validMoveFound:
    randomI = random.randint(0, 999)
    randomJ = random.randint(0, 999)

    validMoveFound = True
    for move in moves:
      if euclideanDistance(randomI, randomJ, move[0], move[1]) < 66:
        validMoveFound = False

    if validMoveFound:
      nextI = randomI
      nextJ = randomJ

  print(nextI, nextJ)
  s.sendall("{} {}".format(nextI, nextJ).encode('utf-8'))

s.close()
