var sysUser = {
	queryAll: 'SELECT * FROM sys_user',
	getUserByUserName: 'SELECT * FROM sys_user WHERE user_name = ? ',
	checkUser: 'SELECT * FROM sys_user WHERE user_name = ? and pass_word = ?',
	into: 'insert into sys_user (user_name,pass_word,mail,creat_time) values(?,?,?,?)',
	edit: 'insert into article (author,title,context,tags,creat_time,modify_time) values(?,?,?,?,?,?)',
	getArticleById: 'SELECT * FROM article WHERE id = ?',
	getArticleAll: 'SELECT * FROM article order by creat_time desc limit ?,?',
	getArticleCount: 'SELECT COUNT(1) AS total FROM article'
};

var sysMusic = {

};
module.exports = {
	sysUser: sysUser,
	sysMusic: sysMusic
};