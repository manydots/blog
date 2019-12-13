var sysUser = {
	queryAll: 'SELECT * FROM sys_user',
	getUserByUserName: 'SELECT * FROM sys_user WHERE username = ? ',
	getOne: 'SELECT * FROM sys_user limit ?,? '
};

var sysMusic = {

};
module.exports = {
	sysUser: sysUser,
	sysMusic:sysMusic
};