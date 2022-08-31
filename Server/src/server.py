"""server.py: Starts a simple https server which serves the web application."""
__author__ = "Steffen-Sascha Stein, Nataliya Elchina, Dennis Oberst"

import http.server
import socketserver

# Simple HTTP Server for communication

PORT = 8000
# Distribution Directory
DIRECTORY = "../../dist"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()