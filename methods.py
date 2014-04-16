"""
An entire file for you to expand. Add methods here, and the client should be
able to call them with json-rpc without any editing to the pipeline.
"""
import RPi.GPIO as gpio

LED_PIN = 11

gpio.setmode(gpio.BOARD)
gpio.setup(LED_PIN, gpio.OUT)


def toggle_led(on):
    gpio.output(LED_PIN, on)
