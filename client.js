/*global io, $, window, console, alert, Blob, saveAs*/
"use strict";

/**
 * Function calls across the background TCP socket. Uses JSON RPC + a queue.
 */
var client = {
    queue: {},
    led_on: false,

    // Connects to Python via a socketio-zeromq bridge
    connect: function (http_port) {
        this.socket = new io.Socket(window.location.hostname,
                                    {port: http_port, rememberTransport: false});
        this.socket.connect();

        this.socket.on("connect", function () {
            console.log("Connected!");
        });

        var self = this;
        this.socket.on("message", function (data) {
            var router, current, updated;
            router = self.queue[data.id];
            delete self.queue[data.id];
            self.result = data.result;

            if (data.error) {
                alert(data.result);
            } else if (router === "toggle_led") {
                $(".answer").html("LED is currently " + (self.led_on ?
                                  "on" : "off") + ".");
            } else {
                alert("Unsupported function: " + router);
            }
        });
    },

    // Generates a unique identifier for request ids
    // Code from http://stackoverflow.com/questions/105034/
    // how-to-create-a-guid-uuid-in-javascript/2117523#2117523
    uuid: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    },

    // Sends a message to toggle the LED
    toggle_led: function () {
        this.led_on = !this.led_on;
        var uuid = this.uuid();
        this.socket.send({method: "toggle_led", id: uuid, params: {on: this.led_on}});
        this.queue[uuid] = "toggle_led";
    }
};

