import socket

class Voronoi_Server:
    def __init__(self, host, port, numberOfPlayers):
        self.host = host
        self.port = port
        self.mySocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.mySocket.setsockopt(socket.SOL_SOCKET,
                socket.SO_REUSEADDR, 1)
        self.mySocket.bind((self.host, self.port))
        self.connection = [None] * numberOfPlayers
        self.address = [None] * numberOfPlayers

    def establishConnection(self, numberOfPlayers):
        self.mySocket.listen(2)

        for i in range(1, numberOfPlayers + 1):
            print "Waiting for player " + str(i)
            self.connection[i - 1], self.address[i - 1] = \
                    self.mySocket.accept()
            print "Connection from Player " + str(i) + " established."

        raw_input("Press Enter to continue...")

    def send(self, string, player):
        self.connection[player].sendall(string)

    def receive(self, player):
        while(1):
            data = self.connection[player].recv(1024)
            # This looks weird right Guyu? Won't that while loop run forever if there's no data?
            while not data:
                continue
            return data
