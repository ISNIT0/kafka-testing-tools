const express = require('express');
const bodyParser = require('body-parser');

const config = require('../config.json');

const md5 = require('md5');
const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.Client(config.Kafka.connectionString);
const producer = new Producer(client);

producer.on('ready', function () {
    console.info(`Producer Ready`);

    const app = express();
    app.use(bodyParser.json());

    app.post('/produce', (req, res) => {
        let {
            message
        } = req.body;

        if(config.producer.encrypt) {
            message += '~' + md5(message);
        }

        producer.send([{
            topic: 'test',
            messages: [message]
        }], (err, data) => {
            if (err) {
                console.error(`Failed to send data to producer:`, err);
                res.status(500).end();
            } else {
                res.end();
            }
        });
    });

    app.listen(config.producer.port, () => {
        console.info(`Producer listening on port [${config.producer.port}]`);
    });
});

producer.on('error', function (err) {
    console.error(`Producer recieved an error:`, err);
});