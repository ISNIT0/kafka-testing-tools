const config = require('../config.json');
const request = require('request-promise-native');
const fuzz = require('./fuzz.js');

let sentMessages = 0;

setInterval(() => {
    const fuzzMessages = fuzz(config.producer.batchSize);
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
}, config.producer.interval);


const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.Client(config.Kafka.connectionString);
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
        console.log(`Latency: [This Message: ${latency}] [Avg: ${avgLatency}] [Recieved Messages: ${++messageCounter}/${sentMessages}] [Rand: ${rand}]`);
    }
});