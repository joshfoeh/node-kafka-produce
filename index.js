const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

var args = process.argv.slice(2);

var host = args[0] == null ? 'localhost' : args[0];
var connectionPort = args[1] == null ? '9092' : args[1];


const kafka = require('kafka-node');
const kafkaClient = new kafka.KafkaClient({kafkaHost: `${host}:${connectionPort}`});
const kafkaProducer = new kafka.Producer(kafkaClient);

const port = 9097;

var isProducerReady = false;

kafkaProducer.on('ready', () => {
	isProducerReady = true;
	console.log('Producer is ready now');
})

kafkaProducer.on('error', (err) => {
	console.log(`Producer hit error: ${err}`);
})

app.post('/produce/:topic', (req, res) => {
	var statusCode, responseBody;
	if (isProducerReady) {
		const topic = req.params.topic;
		console.log(`Sending payload: ${JSON.stringify(req.body, null, 2)}\nto topic: ${topic}`);
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

app.listen(port, () => {
	console.log(`Kafka producer listening on port ${port}`);
})

function sendToKafka(topic, message) {
	var payloads = [{
		topic: topic,
		messages: JSON.stringify(message)
	}];
	kafkaProducer.send(payloads, kafkaProduceCallback);
}

function kafkaProduceCallback(err, data) {
	console.log(`Message sent, err is: ${err}\nData is: ${data}`);
}






