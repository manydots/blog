const { sysUser,query } = require('../utils/sql');

function keywords(callback) {
	query({
		sql: sysUser.getKeyWords
	}).then(function(rows) {
		//console.log(typeof rows,rows)
		let result = [];
		if (typeof rows == 'object') {
			rows.map(item => result.push(item.context));
		}
		callback && callback(result);
	})
}
module.exports = keywords;