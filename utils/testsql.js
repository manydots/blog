const { sysUser,query } = require("./sql");

let batchQueue = [
	["t", "get", "127.0.0.1", "2020-01-02 16:13:23"],
	["t1", "get", "127.0.0.1", "2020-01-02 16:13:23"],
	["t1", "get", "127.0.0.1", "2020-01-02 16:13:23"]
];
query({
	sql: sysUser.intoLimitBatchLog,
	batch: true,
	params: batchQueue
}).then(function(rows) {
	console.log(rows)
}, function(err) {
	console.log(err)
})