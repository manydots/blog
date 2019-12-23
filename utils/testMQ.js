var {
	RabbitMQ
} = require('./rabbitMQ');

let mq = new RabbitMQ();

// mq.sendQueueMsg('testQueue', { msg:'first msg'}, (msg) => {
// 	//success
// 	console.log(msg)
// })

mq.receiveQueueMsg('testQueue', (msg) => {
	console.log(typeof msg, msg)
})