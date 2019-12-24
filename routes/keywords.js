const { sysUser,query } = require('../utils/sql');

function keywords(callback) {
	query(sysUser.getKeyWords, function(err, rows, fields) {
		if (err) {
			callback && callback([]);
		} else {
			//console.log(typeof rows,rows)
			let result = [];
			if(typeof rows == 'object'){
				rows.map(item => result.push(item.context));
			}
			callback && callback(result);
		};
	});
}
module.exports = keywords;