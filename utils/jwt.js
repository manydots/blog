const jwt = require('jsonwebtoken');
const { secretKey } = require('./config');

function verify(content, callback) {
	return jwt.verify(content, secretKey, callback);
}

function sign(content, callback) {
	return jwt.sign(content.token, secretKey, content.option, callback);
}

module.exports = {
	verify: verify,
	sign: sign
};