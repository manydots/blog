var mysqlBase = {
	"host": "",
	"user": "",
	"password": "",
	"database": "",
};

var mailBase = {
	user: '452735383@qq.com',
	pass: '',
	from: 'Blog激活邮件 <452735383@qq.com>',
	subject: 'Blog注册'
}

var secretKey = 'TEST_KEY';

var cookieMaxAge = 15;

module.exports = {
	mysqlBase: mysqlBase,
	secretKey: secretKey,
	mailBase: mailBase,
	cookieMaxAge:cookieMaxAge
};