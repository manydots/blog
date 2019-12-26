const { sysUser,query } = require('./sql');

query({
	sql: sysUser.getKeyWords
}).then(function(rows) {
	console.log(rows)
}, function(err) {
	console.log(err)
})