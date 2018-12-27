# Tibber Pulse live measurement


code is an inspiration from https://github.com/slasktrat/com.tibber



build and run:

docker build -t tlm . && docker run --env-file env.env -t tlm


env.env
    TIBBER_MQTT=mqtt://ip:port
    # TIBBER_MQTT_TOPIC=ams
    # TIBBER_TOKEN=xxxx
    