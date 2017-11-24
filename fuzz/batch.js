const config = require('../config.json');
const LineByLineReader = require('line-by-line');
const path = require('path');
const yargs = require('yargs');
const request = require('request-promise-native');

const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.Client(config.ZooKeeper.connectionString);
const producer = new Producer(client, [{
    autoCommit: true,
    fromOffset: false,
    requireAcks: 1,
    ackTimeoutMs: 100
}]);

yargs
    .command('send', 'Send each line of a file to Kafka', {
        filePath: {
            required: true,
            type: 'string'
        }
    }, function (argv) {
        producer.on('ready', () => {
            const filePath = path.resolve(process.cwd(), argv.filePath);
            console.info(`Using file: ${filePath}`);

            const lr = new LineByLineReader(filePath, {
                skipEmptyLines: true
            });

            lr.on('end', () => {
                console.info(`Reached the end of the file.`);
                process.exit();
            });

            lr.on('error', err => {
                console.error(`Error while reading file:`, err);
            });

            let index = 0;

            lr.on('line', function (line) {
                index++;
                const uid = Date.now() + '~' + Math.floor(Math.random() * 100000);
                line += '~' + uid;
                if ((index % 100) === 0) {
                    console.info(`Has sent [${index}] messages so far, most recent: [${line}]`);
                }

                // console.info(`Sending message [${line}]`);
                // const req = request.post({
                //     method: 'POST',
                //     uri: `http://127.0.0.1:${config.producer.port}/produce`,
                //     body: {
                //         message: line
                //     },
                //     json: true
                // }).catch(err => console.error(`Failed to send message to producer:`, err));

                const req = sendMessage(line);

                if (config.batch.interval === 'complete') {
                    lr.pause();

                    req.then(() => {
                        lr.resume()
                    });
                } else if (config.batch.interval) {
                    lr.pause();
                    setTimeout(() => {
                        lr.resume();
                    }, config.batch.interval);
                } else {

                }
            });
        });
    })
    .command('asOne', '', {
        filePath: {
            required: true,
            type: 'string'
        }
    }, function (argv) {
        producer.on('ready', () => {
            const filePath = path.resolve(process.cwd(), argv.filePath);
            console.info(`Using file: ${filePath}`);
            const file = fs.readFileSync(filePath);

            producer.send([{
                topic: 'batch',
                messages: file.split('\n')
            }], (err, data) => {
                if (err) {
                    console.error(`Failed to send data to producer:`, err);
                } else {
                    console.info(`Done.`);
                }
            });
        });
    })
    .help()
    .argv;



function sendMessage(message) {
    return new Promise((resolve, reject) => {
        producer.send([{
            topic: 'batch',
            messages: [message]
        }], (err, data) => {
            if (err) {
                console.error(`Failed to send data to producer:`, err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
}