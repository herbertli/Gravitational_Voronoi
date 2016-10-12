import socket

class Voronoi_Server:
    def __init__(self, host, port, numberOfPlayers):
        self.host = host
        self.port = port
        self.mySocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.mySocket.bind((self.host, self.port))
        self.connection = [None] * numberOfPlayers
        self.address = [None] * numberOfPlayers

    def establishConnection(self):
        self.mySocket.listen(2)

        print "Waiting for player 1."
        self.connection[0], self.address[0] = self.mySocket.accept()
        print "Connection from Player 1 established."

        print "Waiting for player 2."
        self.connection[1], self.address[1] = self.mySocket.accept()
        print "Connection from Player 2 established."

        raw_input("Press Enter to continue...")

    def send(self, string, player):
        self.connection[player].sendall(string)

    def receive(self, player):
        while(1):
            data = self.connection[player].recv(1024)
            while not data:
                continue
            return data
