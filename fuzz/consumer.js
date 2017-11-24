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
        let latency;
        const now = Date.now();
        try {
            const [text, ts, rand, md5hash] = message.value.split('~'); //TODO: something better
            latency = now - Number(ts);
        } catch (err) {}
        console.log(`Recieved Messages: [${messageCounter++}] [Latency: ${latency}] [${String(message.value).slice(0,100)}]`);
    }
});