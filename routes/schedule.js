const schedule = require('node-schedule');

// *    *    *    *    *    *
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

//6个占位符从左到右分别代表：秒、分、时、日、月、周几
//*表示通配符，匹配任意，当秒是*时，表示任意秒数都触发，其它类推

function scheduleCron(rabbitMQ, callback) {
	//dayOfWeek
	//month
	//dayOfMonth
	//hour
	//minute
	//second

	//每分钟的第30秒定时执行一次:
	const j = schedule.scheduleJob('30 1 * * * *', function() {
		console.log(`定时器已触发:${new Date()}`);
		rabbitMQ.receiveQueueMsg('testQueue', (msg) => {
			console.log(`[receiveQueueMsg]:success.`);
		})
	});

	callback && callback(j);
	//定时器取消
	//j.cancel(); 
}

module.exports = {
	scheduleCron: scheduleCron
}