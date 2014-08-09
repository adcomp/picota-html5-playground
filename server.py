#!/usr/bin/python

import json
import tornado.websocket
import tornado.ioloop

PORT = 8888

class WSHandler(tornado.websocket.WebSocketHandler):
  client = []

  def initialize(self, data):
    self.typeof = data

  def open(self, *args):
    if self.typeof == 'client':
      WSHandler.client.append(self)
    print('new connection : %s' % self.typeof)

  def on_message(self, message):
    print(message)
    for c in WSHandler.client:
      c.write_message(message)

  def on_close(self):
    if self.typeof == 'client':
      WSHandler.client.remove(self)
    print('connection closed')

  # To accept all cross-origin traffic, always return true
  def check_origin(self, origin):
    return True

if __name__ == "__main__":
  application = tornado.web.Application([
    (r'/remote', WSHandler, dict(data = 'remote')),
    (r'/client', WSHandler, dict(data = 'client')) ])
  application.listen(PORT)
  print('WebSocket Server start ..')
  try:
    ioloop = tornado.ioloop.IOLoop.instance()
    ioloop.start()
  except KeyboardInterrupt:
    ioloop.stop()
    print('WebSocket Server stop ..')
