import SimpleHTTPServer
import SocketServer

PORT = 9000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

httpd = SocketServer.TCPServer(("", PORT), Handler)

print "Serving at port", PORT

try:
	httpd.serve_forever()

except KeyboardInterrupt:
	print "Shutting Down..."
	httpd.socket.close()