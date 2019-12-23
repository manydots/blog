var sysUser = {
	queryAll: 'SELECT * FROM sys_user',
	getUserByUserName: 'SELECT * FROM sys_user WHERE user_name = ? ',
	checkUser: 'SELECT * FROM sys_user WHERE user_name = ? and pass_word = ?',
	into: 'insert into sys_user (user_name,pass_word,mail,creat_time) values(?,?,?,?)',
	edit: 'insert into article (author,user_id,title,context,tags,creat_time,modify_time) values(?,?,?,?,?,?,?)',
	getArticleById: 'SELECT * FROM article WHERE id = ?',
	getArticleAll: 'SELECT a.id,a.author,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time,af.follower FROM article a LEFT JOIN article_follow af on a.id = af.article_id order by creat_time desc limit ?,?',
	getArticleCount: 'SELECT COUNT(1) AS total FROM article',
	getFollowLog: 'SELECT article_id,follower FROM article_follow WHERE article_id = ?',
	intoFollowLog: 'insert into article_follow (article_id,user_id,type,follower,creat_time) values(?,?,?,?,?)',
	updateFollowLog: 'UPDATE article_follow SET follower = ? , creat_time = ? WHERE article_id = ?'
};

module.exports = {
	sysUser: sysUser
};