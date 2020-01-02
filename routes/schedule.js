const schedule = require('node-schedule');
const { formatDate } = require('../utils/index');
const { sysUser,query } = require('../utils/sql');

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
	let batchNumber = 0;
	let batchQueue = [];
	const j = schedule.scheduleJob('30 * * * * *', function() {
		console.log(`[${formatDate()}]:每分钟第30秒定时器已触发`);
		rabbitMQ.receiveQueueMsg('testQueue', (msg) => {
			if (msg && batchNumber < 20) {
				batchNumber++;
				if (typeof msg == 'string') {
					msg = JSON.parse(msg);
				};
				let api = msg[0].values;
				let method = msg[1].values;
				let ip = msg[2].values;
				let ct = msg[3].values;
				batchQueue.push([api, method, ip, ct]);
			} else if (msg && batchNumber >= 20) {
				query({
					sql: sysUser.intoLimitBatchLog,
					batch: true,
					params: batchQueue
				}).then(function(res) {
					console.log(`[批量插入intoLimitBatchLog日志]:success.`);
				});
				batchNumber = 1;
				batchQueue = [];
				let api = msg[0].values;
				let method = msg[1].values;
				let ip = msg[2].values;
				let ct = msg[3].values;
				batchQueue.push([api, method, ip, ct]);
			}
			console.log(`[receiveQueueMsg]:success. [当前队列]:${batchNumber}`);
		})
	});

	callback && callback(j);
	//定时器取消
	//j.cancel(); 
}
module.exports = {
	scheduleCron: scheduleCron
}