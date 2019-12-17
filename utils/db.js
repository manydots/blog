const mysql = require("mysql");
const {
	mysqlBase
} = require("./config");

const {
	MD5
} = require('./crypto');

// 创建连接
const pool = mysql.createPool({
	host: mysqlBase.host,
	user: mysqlBase.user,
	password: mysqlBase.password,
	database: mysqlBase.database
})

function query(sql, callback, identifiers) {
	pool.getConnection(function(err, connect) {
		if (err) {
			if (callback) {
				callback(err, null, null);
			};

		} else {
			if (identifiers) {


				if (typeof identifiers === 'object') {
					identifiers = identifiers.map(function(val, index) {
						if (val.encryption && val.encryption == true) {
							return MD5(val.values)
						} else {
							return val.values
						}

					})

				}
				connect.query(sql, identifiers, function(qerr, vals, fields) {
					if (callback) {
						callback(qerr, vals, fields);
					}
					//释放连接
					connect.release();
				});
			} else {
				connect.query(sql, function(qerr, vals, fields) {
					if (callback) {
						callback(qerr, vals, fields);
					}
					//释放连接
					connect.release();
				});
			}
		}
	});
};

module.exports = {
	query: query
}