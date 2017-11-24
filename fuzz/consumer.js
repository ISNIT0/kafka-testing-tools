const config = require('../config.json');

const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.Client(config.ZooKeeper.connectionString);
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
        console.log(`Recieved Messages: [${messageCounter++}] [${String(message.value).slice(0,20)}]`);
    }
});