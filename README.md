pi-websocket
============

Toggle an LED from your browser using websockets and a raspberry pi.

This repository is intended to be a "hello world" for controlling things with
your pi + websockets. It's short and modular, and adding other pi functions
or UI elements should be simple and straightforward.

Why websockets?
===============

There are already many servers written for the Pi utilizing HTTP protocols.
However, websockets offer low-latency communication and tighter JSON-RPC
structures ([source](http://stackoverflow.com/questions/14703627/websockets-protocol-vs-http)).
This protocol may be more complex to set up for the first time, but working
with it is clean and simple.

This library does not use websocket wrappers like [socket.io](http://socket.io/)
or fallback protocols like Flash. This is pure websocket. As such, it requires
using a [supported browser](http://en.wikipedia.org/wiki/WebSocket).

Requirements
============

Get a raspberry pi. Wire an LED to it like so:

![](https://projects.drogon.net/wp-content/uploads/2012/06/1led_gpio_bb1.jpg)

Open a terminal in your pi, and install these Python dependencies:

```
pip install tornado RPi.GPIO
```

Then clone this repository:

```
git clone https://github.com/patrickfuller/pi-websocket.git
```

Usage
=====

On your pi, run the server:

```
cd pi-websocket
sudo python server.py
```

Open a browser and point it to http://your.pi.ip.address:8000. You can now
remotely toggle that LED remotely to your heart's content!
