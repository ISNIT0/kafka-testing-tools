const config = require('../config.json');
const LineByLineReader = require('line-by-line');
const path = require('path');
const yargs = require('yargs');
const request = require('request-promise-native');

yargs
    .command('send', 'Send each line of a file to Kafka', {
        filePath: {
            required: true,
            type: 'string'
        }
    }, function (argv) {
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

        lr.on('line', function (line) {
            const uid = Date.now() + '~' + Math.floor(Math.random() * 100000);
            line += '~' + uid;
            console.info(`Sending message [${line}]`);
            const req = request.post({
                method: 'POST',
                uri: `http://127.0.0.1:${config.producer.port}/produce`,
                body: {
                    message: line
                },
                json: true
            }).catch(err => console.error(`Failed to send message to producer:`, err));

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
    })
    .help()
    .argv;