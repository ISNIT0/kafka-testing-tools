const config = require('../config.json');

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

let messageCounter = 0;

consumer.on('message', function (message) {
    if (message.value) {
        console.log(`Recieved Messages: [${messageCounter++}]`);
    }
});