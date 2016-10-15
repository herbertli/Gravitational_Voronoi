import Voronoi_Server
import time
import sys
import math
import socket

def euclideanDistance(x1, y1, x2, y2):
	distance = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
	return math.sqrt(distance)

def declareWinner(scores):
	maxScore = scores[0]
	winner = [1]

	if maxScore == -1:
		print "Illegal move by Player 1"

	if maxScore == -2:
		print "Player 1 timed out"

	print "Player {} score: {}".format(1, scores[0])

	for i in range(1, len(scores)):
		if scores[i] == -1:
			print "Illegal move by Player {}".format(i + 1)

		if scores[i] == -2:
			print "Illegal move by Player {}".format(i + 1)

		print "Player {} score: {}".format(i + 1, scores[i])

		if scores[i] == maxScore:
			winner.append(i + 1)
		elif scores[i] > maxScore:
			maxScore = scores[i]
			winner = [i + 1]

	if len(winner) == 1:
		print "\nWinner: Player {}".format(winner[0])
	else:
		print "Tied between:"
		for player in winner:
			print "Player {}".format(player)

# -----------------------------------------------------------------------------

# Setting up game environment
numberOfPlayers = 2;
grid = [[0] * 1000 for item in range(0, 1000)]
scoreGrid = [[0] * 1000 for item in range(0, 1000)]
N = int(sys.argv[1])

server = Voronoi_Server.Voronoi_Server('', 9000, numberOfPlayers)
server.establishConnection()

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

players = [i for i in range(1, numberOfPlayers + 1)]
stonesPlayed = [[] for i in range(numberOfPlayers)]
scores = [0] * numberOfPlayers
timeForPlayers = [120] * numberOfPlayers

# Keeps the current pull of all stones belonging to player pull[i] for all
# points in the grid
pull = []
for i in range(numberOfPlayers):
	pull.append([[0] * 1000 for item in range(0, 1000)])

currentTurn = 0
movesMade = 0
gameEnded = 0

moves = []

print "\nStarting\n"

while (1):

	currentTurn = currentTurn % numberOfPlayers

	# -------------------------------------------------------------------------
	# Send grid and game info to players
	# -------------------------------------------------------------------------
	# The game state is sent as a long string S
	# S[0]  		 --> Game State: 0 == Game running, 1 == Game finished
	# S[1]  		 --> The number of moves that have been played so far
	# S[2, 3, 4 ...] --> i-coordinate, j-coordinate, and player

	
	gameInfo = " ".join(str(x) for x in moves)
	gameInfo = str(gameEnded) + " " + str(len(moves)/3) + " " + gameInfo

	if gameEnded == 1:
		for player in players:
			server.send(gameInfo, player - 1)
		break

	else:
		server.send(gameInfo, currentTurn)

	# -------------------------------------------------------------------------
	# Accept and validate player response
	# -------------------------------------------------------------------------

	print "Waiting for Player {}".format(currentTurn + 1)
	print "They have {} seconds remaining".format(timeForPlayers[currentTurn])
	startTime = time.time()
	playerResponse = ""
	playerResponse = server.receive(currentTurn)
	endTime = time.time()

	timeForPlayers[currentTurn] -= endTime - startTime

	data = playerResponse.split()

	i = int(data[0])
	j = int(data[1])

	print "Player {} has placed their stone on: {}, {}\n". \
		format(currentTurn + 1, i, j)

	# If a stone was already placed at the given position
	if grid[i][j] != 0:
		scores[currentTurn] = -1
		gameEnded = 1

	# If i and j are outside the grid
	if i < 0 or i > 999:
		scores[currentTurn] = -1
		gameEnded = 1

	if j < 0 or j > 999:
		scores[currentTurn] = -1
		gameEnded = 1

	# If there are other stones within a euclidean distance of 66
	for iCoordinate in range(max(0, i - 66), min(1000, i + 66)):
		for jCoordinate in range(max(0, j - 66), min(1000, i + 66)):
			if grid[iCoordinate][jCoordinate] != 0:
				distance = (iCoordinate - i) * (iCoordinate - i) + \
						   (jCoordinate - j) * (jCoordinate - j)
				distance = math.sqrt(distance)

				if distance < 66:
					scores[currentTurn] = -1
					gameEnded = 1

	grid[i][j] = currentTurn + 1
	stonesPlayed[currentTurn].append(i * N + j)

	moves.append(i)
	moves.append(j)
	moves.append(currentTurn + 1)

	# -------------------------------------------------------------------------
	# Calculate and update score for each player
	# -------------------------------------------------------------------------

	for x in range(0, 1000):
		for y in range(0, 1000):

			if x == i and y == j:
				continue
			Di = euclideanDistance(x, y, i, j)
			pull[currentTurn][x][y] += float(float(1) / float(Di * Di)) 

			oldPlayer = scoreGrid[x][y]
			if oldPlayer == 0:
				scoreGrid[x][y] = currentTurn + 1
				scores[currentTurn] += 1
			else:	
				if pull[currentTurn][x][y] > pull[oldPlayer - 1][x][y] and \
				oldPlayer - 1 != currentTurn:
					scoreGrid[x][y] = currentTurn + 1
					scores[oldPlayer - 1] -= 1
					scores[currentTurn] += 1

	message = str(i) + " " + str(j) + " " + str(currentTurn + 1)
	sock.sendto(message.encode('utf-8'), ('', 8080))

	# -------------------------------------------------------------------------
	# Assess winning/losing conditions
	# -------------------------------------------------------------------------

	if timeForPlayers[currentTurn] < 0:
		scores[currentTurn] = -2
		gameEnded = 1

	movesMade = movesMade + 1
	if movesMade == N * 2:
		gameEnded = 1

	currentTurn = currentTurn + 1

declareWinner(scores)
print "\nGame Ended"
