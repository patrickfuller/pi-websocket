"""
Currently implements zeroMQ sockets server side, which are mapped to javascript
websockets wrapped with SocketIO using tornado.
    * zeroMQ - A wrapper around sockets that handles a lot of messiness
               involved with network connections
    * socketIO - A wrapper around javascript websockets that handles the
                 differences in implementations across browser/OS combinations
    * tornado - A Python-based web framework that allows us to convert easily
                between the zeroMQ and socketIO wrappers.
It sounds complicated to use all of these libraries, but it makes this approach
more robust and surprisingly easier.
"""
import os
import traceback

import zmq
from zmq.eventloop import ioloop, zmqstream
ioloop.install()

import tornado
import tornado.web
import tornadio
import tornadio.router
import tornadio.server

import methods


class IndexHandler(tornado.web.RequestHandler):

    def get(self):
        self.write(INDEX)


class ClientConnection(tornadio.SocketConnection):

    def on_message(self, message):
        """Evaluates the function pointed to by json-rpc."""
        error = None
        try:
            # The only available method is `count`, but I'm generalizing
            # to allow other methods without too much extra code
            result = getattr(methods,
                             message["method"])(**message["params"])
        except:
            # Errors are handled by enabling the `error` flag and returning a
            # stack trace. The client can do with it what it will.
            result = traceback.format_exc()
            error = 1
        self.send({"result": result, "error": error, "id": message["id"]})


if __name__ == "__main__":
    import argparse
    import webbrowser

    root = os.path.normpath(os.path.dirname(__file__))

    parser = argparse.ArgumentParser(description="Starts a websocket-based "
                                     "webserver and client")
    parser.add_argument("--http-port", type=int, default=8000, help="The port "
                        "on which to serve the website")
    parser.add_argument("--tcp-port", type=int, default=8001, help="The "
                        "server-side tcp connection for python-js interaction")
    args = parser.parse_args()

    with open(os.path.join(root, "index.html")) as index_file:
        INDEX = index_file.read() % {"port": args.http_port}

    WebClientRouter = tornadio.get_router(ClientConnection)
    handler = [(r"/", IndexHandler), WebClientRouter.route(),
               (r'/static/(.*)', tornado.web.StaticFileHandler,
                {'path': root})]
    kwargs = {"enabled_protocols": ["websocket"],
              "socket_io_port": args.http_port}
    application = tornado.web.Application(handler, **kwargs)

    webbrowser.open("http://localhost:%d/" % args.http_port, new=2)

    try:
        context = zmq.Context()
        socket = context.socket(zmq.REP)
        socket.bind("tcp://127.0.0.1:%d" % args.tcp_port)
        stream = zmqstream.ZMQStream(socket, tornado.ioloop.IOLoop.instance())
        stream.on_recv(ClientConnection.on_message)
        tornadio.server.SocketServer(application)
    except:
        methods.gpio.cleanup()
