var sysUser = {
	queryAll: 'SELECT * FROM sys_user',
	getUserByUserName: 'SELECT user_name FROM sys_user WHERE user_name = ? ',
	checkUser: 'SELECT * FROM sys_user WHERE user_name = ? and pass_word = ?',
	into: 'insert into sys_user (user_name,pass_word,mail,creat_time) values(?,?,?,?)',
	edit: 'insert into article (author,user_id,title,context,tags,creat_time,modify_time) values(?,?,?,?,?,?,?)',
	updateEditById: 'UPDATE article SET reply = ?,title = ? , context = ? , tags = ? , modify_time = ? WHERE id = ?',
	getArticleById: "SELECT a.id,a.author,a.state,a.reply,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time FROM article a WHERE id = ? AND state = ?",
	getArticleOwner: 'SELECT a.id,a.state,a.user_id FROM article a WHERE id = ? AND user_id = ?',
	getReplyByArticleId: "SELECT a.id,su.user_name,a.article_id,a.user_id,a.content,a.creat_time FROM article_reply a LEFT JOIN sys_user su ON su.id = a.user_id WHERE article_id = ? order by creat_time desc limit ?,?",
	getReplyCount:'SELECT COUNT(1) AS total FROM article_reply WHERE article_id = ?',
	getArticleByUserId: "SELECT a.id,a.author,a.state,a.reply,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time FROM article a WHERE user_id = ? AND state = ? order by creat_time desc limit ?,?",
	getArticleAll: "SELECT a.id,a.author,a.state,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time,af.follower FROM article a LEFT JOIN article_follow af on a.id = af.article_id WHERE a.state = ? order by creat_time desc limit ?,?",
	getArticleCount: 'SELECT COUNT(1) AS total FROM article WHERE state = ?',
	getArticleUserCount: 'SELECT COUNT(1) AS total FROM article WHERE user_id = ? AND state = ? ',
	getFollowLog: 'SELECT article_id,follower FROM article_follow WHERE article_id = ? ',
	intoFollowLog: 'insert into article_follow (article_id,user_id,type,follower,creat_time) values(?,?,?,?,?)',
	updateFollowLog: 'UPDATE article_follow SET follower = ? , creat_time = ? WHERE article_id = ?',
	intoLimitLog: 'insert into limited (api,method,ip,creat_time) values(?,?,?,?)',
	getKeyWords: 'SELECT context FROM keywords',
	updateUser: 'UPDATE sys_user SET token = ? WHERE id = ?',
	deleteArticleById: 'DELETE FROM article WHERE id = ? AND user_id = ?',
	deleteArticleByIdState: "UPDATE article SET state = ? WHERE id = ? AND user_id = ?",
	intoReplyLog:'insert into article_reply (article_id,user_id,content,creat_time) values(?,?,?,?)'
};

var {
	query
} = require('./db');

module.exports = {
	sysUser: sysUser,
	query: query
};