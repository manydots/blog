const CryptoJS = require('crypto-js');
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412'); //密钥偏移量
const key = CryptoJS.enc.Utf8.parse('1234123412ABCDEF');

//MD5加密
function MD5(context) {
	return CryptoJS.MD5(context).toString();
}

//AES解密方法
function Decrypt(context) {
	let encryptedHexStr = CryptoJS.enc.Hex.parse(context);
	let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
	let decrypt = CryptoJS.AES.decrypt(srcs, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
	return decryptedStr.toString();
}

//AES加密方法
function Encrypt(context) {

	let srcs = CryptoJS.enc.Utf8.parse(context);
	let encrypted = CryptoJS.AES.encrypt(srcs, key, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	});
	return encrypted.ciphertext.toString().toUpperCase();
}

module.exports = {
	MD5: MD5,
	Decrypt: Decrypt,
	Encrypt: Encrypt
};