
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

			socket.on('http-index-message', function(data) {
				//x-real-ip x-forwarded-for 通过nginx后的真实ip
				//console.log(socket.handshake.headers)
				//仅[127.0.0.1:3035,music.jeeas.cn]
				if (socket.handshake.headers.host == '127.0.0.1:3035') {
					
				} else {
					socket.emit('songs', {
						code: -103,
						msg: 'ip-limit.'
					});
				}

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