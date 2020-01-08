var { sysUser, query } = require("./sql");

function bulkIndex(index, type, data, client) {
	//开启elasticsearch服务
	if (!client) {
		return;
	}
	let bulkBody = [];
	data.forEach(item => {
		bulkBody.push({
			index: {
				_index: index,
				_type: type,
				_id: item.id
			}
		});
		bulkBody.push(item);
	});
	client.bulk({
			body: bulkBody
		})
		.then(response => {
			console.log(`索引[${index}]数据定时更新成功.`)
			//let errorCount = 0;
			// response.items.forEach(item => {
			// 	if (item.index && item.index.error) {
			// 		console.log(++errorCount, item.index.error);
			// 	}
			// });
			// console.log(`Successfully indexed ${data.length - errorCount} out of ${data.length} items`);
		})
		.catch(console.err);
};

function bulk(esClient) {
	//全量更新数据
	if (esClient) {
		query({
			sql: sysUser.getArticleEsAll,
			params: '0'
		}).then(function(rows) {
			bulkIndex('blog_article', '_doc', rows, esClient);
		}, function(err) {
			//console.log(err)
		})
	}
};

module.exports = {
	bulk: bulk
}