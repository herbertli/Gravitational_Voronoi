import Voronoi_Server
import time
import sys
import math
import socket

def euclideanDistance(x1, y1, x2, y2):
	distance = abs((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))
	return math.sqrt(distance)

def declareWinner(scores):
	maxScore = scores[0]
	winner = [1]

	if maxScore == -1:
		print "Illegal move by " + server.names[0]

	if maxScore == -2:
		print server.names[0] + " timed out"

	print "{} score: {}".format(server.names[0], scores[0])

	for i in range(1, len(scores)):
		if scores[i] == -1:
			print "Illegal move by {}".format(server.names[i])

		if scores[i] == -2:
			print "{} timed out".format(server.names[i])

		print "{} score: {}".format(server.names[i], scores[i])

		if scores[i] == maxScore:
			winner.append(i + 1)
		elif scores[i] > maxScore:
			maxScore = scores[i]
			winner = [i + 1]

	if len(winner) == 1:
		print "\nWinner: {}".format(server.names[winner[0] - 1])
	else:
		print "Tied between:"
		for player in winner:
                    print server.names[player - 1]

# -----------------------------------------------------------------------------


# Setting up game environment
numberOfPlayers = int(sys.argv[2]);
grid = [[0] * 1000 for item in range(0, 1000)]
scoreGrid = [[0] * 1000 for item in range(0, 1000)]
N = int(sys.argv[1])


sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto('reset'.encode('utf-8'), ('', 8080))

PORT = int(sys.argv[3])
server = Voronoi_Server.Voronoi_Server('', PORT, numberOfPlayers)
server.establishConnection(numberOfPlayers, N)


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

	print "Waiting for {}".format(server.names[currentTurn])
	print "They have {} seconds remaining".format(timeForPlayers[currentTurn])
	startTime = time.time()
	playerResponse = ""
	playerResponse = server.receive(currentTurn)
	endTime = time.time()

	timeForPlayers[currentTurn] -= endTime - startTime

	data = playerResponse.split()

	i = int(data[0])
	j = int(data[1])

	print "{} has placed their stone on: {}, {}\n". \
		format(server.names[currentTurn] , i, j)

        # GUYU: Maybe we can do something here so we support continuing the game if there are more than 2 players, but just eliminating the player that made the mistake?
	# If a stone was already placed at the given position
	if grid[i][j] != 0:
		scores[currentTurn] = -1
		gameEnded = 1
                continue

	# If i and j are outside the grid
	if i < 0 or i > 999:
		scores[currentTurn] = -1
		gameEnded = 1
                continue

	if j < 0 or j > 999:
		scores[currentTurn] = -1
		gameEnded = 1
                continue

	# If there are other stones within a euclidean distance of 66
        for moveStartIndex in range(0, len(moves), 3):
            if euclideanDistance(i, j, moves[moveStartIndex], moves[moveStartIndex + 1]) < 66:
                scores[currentTurn] = -1
                gameEnded = 1
                break

	if gameEnded == 1:
            continue

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

        message = ""
        for scoreList in scoreGrid:
            message += " ".join(map(str, scoreList)) + " "
	message += str(numberOfPlayers) + " " + str(currentTurn + 1) + " " + str(i) + " " + str(j)
        # For some reason the previous architects decided to use UDP which has a 1500 byte sending limit
        # so I'm just choosing to follow that and creating a work around. It's probably so that they didn't have to check if web.js was running and it could therefore work without graphical interface
        sock.sendto('start'.encode('utf-8'), ('', 8080))
        for i in range(0, len(message), 1000):
            sock.sendto(message[i:i+1000].encode('utf-8'), ('', 8080))
	sock.sendto('end'.encode('utf-8'), ('', 8080))

	# -------------------------------------------------------------------------
	# Assess winning/losing conditions
	# -------------------------------------------------------------------------

	if timeForPlayers[currentTurn] < 0:
		scores[currentTurn] = -2
		gameEnded = 1

	movesMade = movesMade + 1
	if movesMade == N * numberOfPlayers:
		gameEnded = 1

	currentTurn = currentTurn + 1

declareWinner(scores)
print "\nGame Ended"
