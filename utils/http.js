// var { RabbitMQ } = require('./rabbitMQ');
// let mq = new RabbitMQ();

function initServer(io, callback) {
	if (io) {
		io.on('connection', function(socket) {
			//给除了自己以外的客户端广播消息
			// socket.broadcast.emit('news', {
			// 	message: 'new connection',
			// 	newsType: 'server-prop-broadcast',
			// 	dataType: 'string'
			// });

			//给所有客户端广播消息
			//io.sockets.emit("msg",{data:"hello,all"});
			socket.on('disconnect', function() {
				//console.log(`---Left.---`)
			});

			socket.on('message', function(data) {
				//console.log(data)
			});

			socket.on('Consumer-Queues', function(data) {
				// mq.receiveQueueMsg('testQueue', (msg) => {
				// 	console.log(`[receiveQueueMsg]:success.`);
				// })
			});

			if (callback) {
				callback(socket)
			}
		});
	}
}

module.exports = {
	initServer: initServer
}