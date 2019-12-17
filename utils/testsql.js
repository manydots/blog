const {
	sysUser
} = require('./sql');
const {
	query
} = require('./db');

const {
	formatDate
} = require('./index');


let params = [{
	values: 'admin',
	column: 'user_name'
}, {
	values: 'admin123456',
	column: 'pass_word',
	encryption: true
}, {
	values: '11914146@qq.com',
	column: 'mail'
}, {
	values: formatDate(),
	column: 'creat_time'
}];
query(sysUser.into, function(err, rows, fields) {
	if (err) {
		console.log(err)
	} else {
		console.log('success')
	};
}, params);