/*global WebSocket, $, window, console, alert, Blob, saveAs*/
"use strict";

/**
 * Function calls across the background TCP socket. Uses JSON RPC + a queue.
 */
var client = {
    queue: {},
    led_on: false,

    // Connects to Python through the websocket
    connect: function (port) {
        var self = this;
        this.socket = new WebSocket("ws://" + window.location.hostname + ":" + port + "/websocket");

        this.socket.onopen = function () {
            console.log("Connected!");
        };

        this.socket.onmessage = function (messageEvent) {
            var router, current, updated, jsonRpc;

            jsonRpc = JSON.parse(messageEvent.data);
            router = self.queue[jsonRpc.id];
            delete self.queue[jsonRpc.id];
            self.result = jsonRpc.result;

            // Alert on error
            if (jsonRpc.error) {
                alert(jsonRpc.result);

            // If the server returns, change the LED message. Note that this
            // is unnecessary complexity, but I want to show off how to extend
            // server response handling.
            } else if (router === "toggle_led") {
                $(".answer").html("LED is currently " + (self.led_on ?
                                  "on" : "off") + ".");

            // No other functions should exist
            } else {
                alert("Unsupported function: " + router);
            }
        };
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
        this.socket.send(JSON.stringify({method: "toggle_led", id: uuid, params: {on: this.led_on}}));
        this.queue[uuid] = "toggle_led";
    }
};

