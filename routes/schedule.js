const schedule = require('node-schedule');
const { formatDate } = require('../utils/index');
const { sysUser, query } = require('../utils/sql');
const { bulk,upDate,bulkIndex } = require('../utils/importdata');

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
	let esbatchNumber = 0;
	let esbatchQueue = '';
	let esbatchQueueMap = [];
	const j = schedule.scheduleJob('30 * * * * *', function() {
		console.log(`[${formatDate()}]:每分钟第30秒定时器已触发`);

		//web访问日志队列
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
			};
			console.log(`[receive-testQueue]:success. [当前队列]:${batchNumber}`);
		})

		//elasticsearch批量更新队列
		//bulk[全量同步],upDate[单条增量同步],bulkIndex[批量]
		//文章修改超过2条以上触发更新
		rabbitMQ.receiveQueueMsg('esArticleQueue', (text) => {
			if (typeof text == 'string') {
				text = JSON.parse(text);
			};
			//SQL IN(1,2,3)不好构造,使用OR构造
			let id = text.id;
			if (text && esbatchNumber < 2) {
				if (!esbatchQueue.includes(id)) {
					esbatchNumber++;
					esbatchQueue += ` id = ${id} OR`;
				}
			} else {
				let len = esbatchQueue.length;
				esbatchQueue = esbatchQueue.substr(0, len - 2);
				//console.log(sysUser.getArticleBulkOr + ' '+esbatchQueue)
				if (flag) {
					query({
						sql: `${sysUser.getArticleBulkOr} ${esbatchQueue}`
					}).then(function(rows) {
						if (esClient) {
							bulkIndex('blog_article', '_doc', rows, esClient);
						};
					});
				};
				esbatchNumber = 1;
				esbatchQueue = ` id = ${id} OR`;
			};
			console.log(`[receive-esArticleQueue]:success. [当前队列]:${esbatchNumber}`);
		})
	});

	//每小时的1分10秒触发 '10 1 * * * *' 全量更新数据
	// const k = schedule.scheduleJob('10 1 * * * *', function() {
	// 	console.log(`[${formatDate()}]:每小时1分10秒索引定时器已触发-未执行`);
	// 	if (esClient) {
	// 		bulk(esClient);
	// 	}
	// })

	callback && callback(j);
	//定时器取消
	//j.cancel(); 
};

module.exports = {
	scheduleCron: scheduleCron
}