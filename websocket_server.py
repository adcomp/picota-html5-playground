#!/usr/bin/python

# PICOTA - WebSocket server
# David Art [aka] ADcomp

import sys
import os
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer

class SimpleEcho(WebSocket):

  clients = []

  def handleMessage(self):
    print('handleMessage ..', str(self.data))
    if self.data is None:
        self.data = ''

    for client in self.clients:
      if (client != self):
        # echo message back to clients
        client.sendMessage(str(self.data))

  def handleConnected(self):
    print(self.address, 'connected')
    self.clients.append(self)

  def handleClose(self):
    print(self.address, 'closed')
    self.clients.remove(self)

server = SimpleWebSocketServer('', 8888, SimpleEcho)
print('WebSocket Server start ..')
try:
  server.serveforever()
except KeyboardInterrupt:
  print('\nExit ..')
  sys.exit(0)
