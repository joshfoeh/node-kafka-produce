const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

var kafkaBrokers = process.env.KAFKA_BROKERS;
var serverPort = process.env.SERVER_PORT;

//todo make sure none of these are null

const kafka = require('kafka-node');
const kafkaClient = new kafka.KafkaClient({kafkaHost: kafkaBrokers});
const kafkaProducer = new kafka.Producer(kafkaClient);

var isProducerReady = false;
var topic = 'toDevice';

kafkaProducer.on('ready', () => {
	isProducerReady = true;
	console.log('Producer is ready now');
})

kafkaProducer.on('error', (err) => {
	console.log(`Producer hit error: ${err}`);
})

app.post('/produce', (req, res) => {
	var statusCode, responseBody;
	if (isProducerReady) {
		// console.log(`Sending payload: ${JSON.stringify(req.body, null, 2)}\nto topic: ${topic}`);
		sendToKafka(topic, req.body);
		statusCode = 200;
		responseBody = {
			success: true
		};
	} else {
		statusCode = 400;
		responseBody = {
			success: false,
			error: 'Producer not ready'
		};
	}
	res.status(statusCode).json(responseBody);
});

app.listen(serverPort, () => {
	console.log(`Kafka producer is listening on port ${serverPort}`);
})

function sendToKafka(topic, message) {
	var payloads = [{
		topic: topic,
		messages: JSON.stringify(message)
	}];
	kafkaProducer.send(payloads, kafkaProduceCallback);
}

function kafkaProduceCallback(err, data) {
	if (err != null) {
		console.log(`Error sending message, err is: ${err}\nData is: ${data}`);
	}
}






