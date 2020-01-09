var { sysUser, query } = require("./sql");

function bulkIndex(index, type, data, client) {
	//开启elasticsearch服务
	if (!client || !data || data.length <= 0) {
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
	}).then(response => {
		console.log(`索引[${index}],数据长度[${data.length}]定时更新成功.`)
		//let errorCount = 0;
		// response.items.forEach(item => {
		// 	if (item.index && item.index.error) {
		// 		console.log(++errorCount, item.index.error);
		// 	}
		// });
		// console.log(`Successfully indexed ${data.length - errorCount} out of ${data.length} items`);
	}).catch(console.err);
};

function upDate(index, type, data, client) {
	//单条更新
	if (!client || !data || data.length <= 0) {
		return;
	};
	let doc = {
		id: data[0].id,
		author: data[0].author,
		state: data[0].state,
		user_id: data[0].user_id,
		reply: data[0].reply,
		title: data[0].title,
		context: data[0].context,
		tags: data[0].tags,
		creat_time: data[0].creat_time,
		modify_time: data[0].modify_time
	};
	client.update({
		index: index,
		type: type,
		id: data[0].id,
		body: {
			doc: doc
		}
	}).then(response => {
		console.log(`索引[${index}]单条数据更新成功.`);
	}).catch(console.err);

}

function bulk(esClient, update) {
	//全量更新数据
	if (esClient) {
		query({
			sql: sysUser.getArticleEsAll,
			params: '0'
		}).then(function(rows) {
			//单条新增（指定_id）
			//http://服务ip:端口/索引index/type/_id
			if (!update) {
				bulkIndex('blog_article', '_doc', rows, esClient);
			} else {
				//upDate('blog_article', '_doc', rows, esClient);
			}

		}, function(err) {
			//console.log(err)
		})
	}
};

module.exports = {
	bulk: bulk,
	bulkIndex: bulkIndex,
	upDate: upDate
}