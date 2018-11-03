const queries = require('./queries'),
    ws = require('ws'),
    ApolloBoost = require('apollo-client'),
    ApolloClient = ApolloBoost.default,
    { GraphQLClient } = require('graphql-request'),
    { WebSocketLink } = require("apollo-link-ws"),
    { InMemoryCache } = require("apollo-cache-inmemory"),
    mqtt = require('mqtt');

let _clients = [];

// TODO extract address
const mqttClient = mqtt.connect('mqtt://192.168.10.157:1883');

mqttClient.on('connect', function () {
    console.log('connected to mqtt server');
});

function getDefaultToken() {
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
    }).subscribe(callback, console.error);
}

(function () {
    const token = process.env.TOKEN || getDefaultToken();
    getHomes(token).then(function (res) {
        subscribeToLive(token, res.viewer.homes[0].id, function (result) {
            console.log(result);
            // TODO extract mqtt topic
            mqttClient.publish('ams', JSON.stringify(result));
        })
    });
})();
