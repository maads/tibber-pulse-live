# Tibber Pulse live measurement


code is an inspiration from https://github.com/slasktrat/com.tibber


## Docker

build and run:

    docker build -t tlm . && docker run --env-file env.env -t tlm


env.env


    TIBBER_MQTT=mqtt://ip:port
    # TIBBER_MQTT_TOPIC=ams
    # TIBBER_TOKEN=xxxx

Obtain token from https://developer.tibber.com/


## Node

If you want to run this from the command line in node without docker

    TIBBER_MQTT=mqtt://ip:port TIBBER_MQTT_TOPIC=ams TIBBER_TOKEN=xxx node app.js
