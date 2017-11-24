const config = require('../config.json');
const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.Client(config.ZooKeeper.connectionString);
const producer = new Producer(client, [{
    autoCommit: true,
    fromOffset: false
}]);

let readyHandler = () => {}
const messageBuffer = [];

const fn = function (message) {
    if (!fn.isReady) {
        messageBuffer.push(message);
    } else {
        producer.send([{
            topic: 'test',
            messages: [message]
        }], (err, data) => {
            if (err) {
                console.error(`Failed to send data to producer:`, err);
                //reject(err);
            } else {
                //resolve();
            }
        });
    }
}

fn.isReady = false;

fn.ready = function (handler) {
    readyHandler = handler;
    messageBuffer.forEach(fn);
}

producer.on('ready', () => {
    fn.isReady = true;
    readyHandler();
});

module.exports = fn;