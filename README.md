## Setup
Install and run ZooKeeper + Kafka on 1 or more machines.
Configure ip addresses in `./config.json`

> You will need Radamsa installed to run any producers.
https://github.com/aoh/radamsa

```bash
> npm i && npm i -g pm2
```

## Run Scripts
#### Consumer
A simple Kafka consumer which will count received messages
```bash
> node fuzz/consumer.js
```
#### Continuous
Starting with `config.producer.continuous.starting` messages, each time it receives a message, it will create another `config.producer.continuous.grow` messages.
```bash
> node fuzz/continuous.js
```
#### Batch
Each `config.producer.interval` ms, it will create `config.producer.batchSize` messages
```bash
> pm2 start ecosystem.config.js && pm2 logs
> pm2 stop all && pm2 kill # Stop sending messages
```

### Sample Network Tests:
```bash
> ssh user@myKafkaNode

> sudo tc qdisc add dev eth0 root netem delay 100ms
> # You will see the message latency instantly increase by 100ms
> sudo tc qdisc del dev eth0 root # To reset network tests

> sudo tc qdisc change dev eth0 root netem loss 10%
> # Some messages' latency will increase dramatically
> sudo tc qdisc del dev eth0 root # To reset network tests
```
