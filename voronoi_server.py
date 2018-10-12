import socket
import json


class VoronoiServer:
    def __init__(self, host: str, port: int, num_players: int):
        self.host = host
        self.port = port
        self.my_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.my_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.my_socket.bind((self.host, self.port))
        self.connection = [None] * num_players
        self.address = [None] * num_players
        self.names = [None] * num_players

    def establish_connection(self, num_players: int, num_stones: int):
        # 2 backlogs (number of unaccepted connections allowed)
        self.my_socket.listen(2)
        for i in range(1, num_players + 1):
            print("Waiting for player " + str(i))
            sock, addr = self.my_socket.accept()
            self.connection[i - 1] = sock
            self.address[i - 1] = addr
            self.send({
                "num_players": num_players,
                "num_stones": num_stones,
                "player_number": i
            }, i - 1)

            response = self.receive(i - 1)
            self.names[i - 1] = response["player_name"]
            print("Connection from Player", self.names[i - 1], "established.")

    def send(self, obj, player: int):
        self.connection[player].sendall(json.dumps(obj).encode('utf-8'))

    def receive(self, player: int):
        while True:
            data = self.connection[player].recv(4096).decode('utf-8')
            if not data:
                continue
            return json.loads(data)
