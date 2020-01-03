const { sysUser,query } = require("./sql");

// let batchQueue = [
// 	["t", "get", "127.0.0.1", "2020-01-02 16:13:23"],
// 	["t1", "get", "127.0.0.1", "2020-01-02 16:13:23"],
// 	["t1", "get", "127.0.0.1", "2020-01-02 16:13:23"]
// ];
// query({
// 	sql: sysUser.intoLimitBatchLog,
// 	batch: true,
// 	params: batchQueue
// }).then(function(rows) {
// 	console.log(rows)
// }, function(err) {
// 	console.log(err)
// })

query({
	sql: sysUser.intoNoticeLog,
	params: [{
		values:11
	},{
		values:12
	},{
		values:'一点都不6'
	},{
		values:'replyer'
	},{
		values:'1'
	},{
		values:'2020-01-03 16:04:23'
	}]
}).then(function(rows) {
	console.log(rows)
}, function(err) {
	//console.log(err)
})