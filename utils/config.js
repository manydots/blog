var mysqlBase = {
	"host": "",
	"user": "",
	"password": "",
	"database": "",
};

var mailBase = {
	user: '',
	pass: '',
	from: '',
	subject: ''
}

var secretKey = 'TEST_KEY';

function getKeys(keys, str) {
	if (typeof str === 'string' && keys != '') {
		str = str.split(';');
	} else if (typeof str === 'object' && keys != '') {
		str = str;
	}
	for (let item in str) {
		if (str[item].indexOf(keys) > -1) {
			return {
				value: getCookieItem(keys, str[item]),
				Expires: getCookieItem('Expires', str[item]),
				values: str[item]
			};
			break;
		}
	}
}

function getCookieItem(name, str) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\;]?" + name + "=([^;]*)"),
		results = regex.exec(str);
	return results == null ? "" : decodeURIComponent(results[1]);
}

module.exports = {
	mysqlBase: mysqlBase,
	secretKey: secretKey,
	getKeys: getKeys,
	getCookieItem: getCookieItem,
	mailBase: mailBase
};