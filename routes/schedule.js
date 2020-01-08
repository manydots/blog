const schedule = require('node-schedule');
const { formatDate } = require('../utils/index');
const { sysUser, query } = require('../utils/sql');
const { bulk } = require('../utils/importdata');

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

function scheduleCron(rabbitMQ, callback, flag, esClient) {
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
			if (typeof msg == 'string') {
				msg = JSON.parse(msg);
			};
			let api = decodeURIComponent(msg[0].values);
			let method = msg[1].values;
			let ip = msg[2].values;
			let ct = msg[3].values;
			if (msg && batchNumber < 20) {
				batchNumber++;
				batchQueue.push([api, method, ip, ct]);
			} else if (msg && batchNumber >= 20) {
				if (flag) {
					query({
						sql: sysUser.intoLimitBatchLog,
						batch: true,
						params: batchQueue
					}).then(function(res) {
						console.log(`[批量插入intoLimitBatchLog日志]:success.`);
					});
				};
				batchNumber = 1;
				batchQueue = [];
				batchQueue.push([api, method, ip, ct]);
			}
			console.log(`[receiveQueueMsg]:success. [当前队列]:${batchNumber}`);
		})
	});

	//每小时的1分10秒触发 '10 1 * * * *' 全量更新数据
	const k = schedule.scheduleJob('10 1 * * * *', function() {
		console.log(`[${formatDate()}]:每小时1分10秒索引定时器已触发`);
		if (esClient) {
			bulk(esClient);
		}
	})

	callback && callback(j);
	//定时器取消
	//j.cancel(); 
};

module.exports = {
	scheduleCron: scheduleCron
}