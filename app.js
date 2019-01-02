const queries = require('./queries'),
    ws = require('ws'),
    ApolloBoost = require('apollo-client'),
    ApolloClient = ApolloBoost.default,
    { GraphQLClient } = require('graphql-request'),
    { WebSocketLink } = require("apollo-link-ws"),
    { InMemoryCache } = require("apollo-cache-inmemory"),
    mqtt = require('mqtt'),
    fs = require('fs'),
    util = require('util');

var logFile = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
var logStdout = process.stdout;

console.log = function (d) {
    const now = new Date().toISOString();
    logFile.write(now + '- ' + util.format(d) + '\n');
    logStdout.write(now + '- ' + util.format(d) + '\n');
};

let _clients = [];

const mqttClient = mqtt.connect(process.env.TIBBER_MQTT);
let isMqttConnected = false;

mqttClient.on('connect', function () {
    console.log('connected to mqtt server: ', process.env.TIBBER_MQTT);
    isMqttConnected = true;
});
mqttClient.on('close', function () {
    isMqttConnected = false;
});
mqttClient.on('error', function () {
    isMqttConnected = false;
});
function getDefaultToken() {
    console.log('using default token');
    return 'd1007ead2dc84a2b82f0de19451c5fb22112f7ae11d19bf2bedb224a003ff74a';
}

function getClient(token) {
    if (!token)
        token = getDefaultToken();
    if (!token)
        throw new Error("Access token not set");

    if (!_clients[token])
        _clients[token] = new GraphQLClient('https://api.tibber.com/v1-beta/gql', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

    return _clients[token];
}

async function getHomes(token) {
    let client = getClient(token);
    return client.request(queries.getHomesQuery())
        .then(data => {
            return data;
        })
        .catch(e => {
            console.error('Error while fetching data', e);
        });
}

function subscribeToLive(token, homeId, callback) {
    if (!token)
        token = getDefaultToken();
    if (!token)
        throw new Error("Access token not set");

    const wsLink = new WebSocketLink({
        uri: 'wss://api.tibber.com/v1-beta/gql/subscriptions',
        options: {
            reconnect: true,
            connectionParams: {
                token: token,
            }
        },
        webSocketImpl: ws
    });

    const wsClient = new ApolloClient({
        link: wsLink,
        cache: new InMemoryCache()

    });

    wsClient.subscribe({
        query: queries.getSubscriptionQuery(homeId),
        variables: {}
    }).subscribe(callback, function (err) {
        console.log('subscribe error', err);
    });
}

(function () {
    process.on('uncaughtException', function (e) {
        console.log(e);
        process.exit(1);
    });
    const token = process.env.TIBBER_TOKEN || getDefaultToken();
    getHomes(token).then(function (res) {
        const primaryHome = res.viewer.homes[0];
        const isPulseEnabled = primaryHome.features.realTimeConsumptionEnabled;
        console.log('pulse enabled', isPulseEnabled);
        if (!isPulseEnabled) {
            console.error('Pulse is not enabled in this home.');
            return;
        }
        subscribeToLive(token, primaryHome.id, function (result) {
            console.info(result);
            if (isMqttConnected) {
                mqttClient.publish(process.env.TIBBER_MQTT_TOPIC || 'ams', JSON.stringify(result));
            }
        })
    });
})();
