const config = require('../config.json');
const request = require('request-promise-native');
const fuzz = require('./fuzz.js');

let sentMessages = 0;


const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.Client('192.168.1.18:2181');
const consumer = new Consumer(
    client, [{
        topic: 'test'
    }], {
        autoCommit: true,
        fromOffset: false
    }
);

let latencies = [];
let messageCounter = 0;

consumer.on('message', function (message) {
    if (message.value) {
        const now = Date.now();
        const [text, ts, rand] = message.value.split('~'); //TODO: something better
        const latency = now - Number(ts);
        if (latency) latencies = latencies.slice(-200).concat(Math.floor(latency));
        const avgLatency = Math.round(latencies.reduce((acc, val) => acc + val, 0) / latencies.length);
        console.log(`Latency: [This Message: ${latency}] [Avg: ${avgLatency}] [Recieved Messages: ${++messageCounter}/${sentMessages}] [Missing: ${sentMessages - messageCounter}] [Rand: ${rand}]`);

        const fuzzMessages = fuzz(config.producer.continuous.growth);
        sentMessages += fuzzMessages.length;
        const uid = Date.now() + '~' + Math.floor(Math.random() * 100000);
        fuzzMessages.forEach(message => {
            message = message + '~' + uid;
            request.post({
                method: 'POST',
                uri: `http://127.0.0.1:${config.producer.port}/produce`,
                body: {
                    message: message
                },
                json: true
            });
        });
    }
});


const fuzzMessages = fuzz(config.producer.continuous.starting);
sentMessages += fuzzMessages.length;
const uid = Date.now() + '~' + Math.floor(Math.random() * 100000);
fuzzMessages.forEach(message => {
    message = message + '~' + uid;
    request.post({
        method: 'POST',
        uri: `http://127.0.0.1:${config.producer.port}/produce`,
        body: {
            message: message
        },
        json: true
    });
});