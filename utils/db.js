const mysql = require("mysql");
const { mysqlBase } = require("./config");
const { MD5 } = require('./crypto');
const { formatDate } = require('./index');

// 创建连接
const pool = mysql.createPool({
	host: mysqlBase.host,
	user: mysqlBase.user,
	password: mysqlBase.password,
	database: mysqlBase.database
});

function query(options) {
	let sql = options.sql ? options.sql : '';
	let identifiers = options.params ? options.params : null;
	let response = options.res ? options.res : null;
	//console.log(options,typeof identifiers)
	return new Promise(function(resolve, reject) {
		pool.getConnection(function(err, connect) {
			if (err) {
				if (response) {
					response.json({
						code: -101,
						msg: '数据库连接错误！'
					});
					return;
				} else {
					reject(err);
				}

			} else {
				if (sql.indexOf('insert into limited') < 0) {
					console.log(`[${formatDate()}]:执行SQL语句,[${sql}]`);
				}
				
				if (identifiers) {
					if (typeof identifiers === 'object') {
						identifiers = identifiers.map(function(val, index) {
							if (val.encryption && val.encryption == true) {
								return MD5(val.values)
							} else if (val.filterKeyWords) {
								if (val.filterKeyWords) {
									val.filterKeyWords.map(function(v) {
										val.values = val.values.replace(v, '*');
									});
								}
								return val.values;
							} else {
								return val.values;
							}
						})
					}
					connect.query(sql, identifiers, function(qerr, vals, fields) {
						if (qerr) {
							if (response) {
								response.json({
									code: -102,
									msg: `数据库操作${sql}时，参数错误！`
								});
								return;
							} else {
								reject(qerr);
							}
						} else {
							resolve(vals);
						}
						//释放连接
						connect.release();
					});
				} else {
					connect.query(sql, function(qerr, vals, fields) {
						if (qerr) {
							if (response) {
								response.json({
									code: -102,
									msg: `数据库操作${sql}时，参数错误！`
								});
								return;
							} else {
								reject(qerr);
							}
						} else {
							resolve(vals);
						}
						//释放连接
						connect.release();
					});
				}
			}
		});
	})

};

//过滤sql关键字，防止注入
function filterSQLKeys(){

}

module.exports = {
	query: query
}