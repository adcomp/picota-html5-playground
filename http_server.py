#!/usr/bin/python

# PICOTA - Simple HTTP server
# David Art [aka] ADcomp

import sys
import os
import BaseHTTPServer
from SimpleHTTPServer import SimpleHTTPRequestHandler

REALPATH = os.path.dirname(os.path.realpath(__file__))
os.chdir("%s/www" % REALPATH)

HandlerClass = SimpleHTTPRequestHandler
ServerClass  = BaseHTTPServer.HTTPServer
Protocol     = "HTTP/1.0"

if __name__ == "__main__":

  if sys.argv[1:]:
      port = int(sys.argv[1])
  else:
      port = 8000
  server_address = ('127.0.0.1', port)

  HandlerClass.protocol_version = Protocol
  httpd = ServerClass(server_address, HandlerClass)
  sockname = httpd.socket.getsockname()
  print("Serving HTTP on", sockname[0], "port", sockname[1], "...")
  try:
    httpd.serve_forever()
  except KeyboardInterrupt:
    print('\nExit ..')
    sys.exit(0)
