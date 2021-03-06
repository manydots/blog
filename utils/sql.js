var sysUser = {
	queryAll: 'SELECT * FROM sys_user',
	getUserByUserName: 'SELECT user_name FROM sys_user WHERE user_name = ? ',
	getUserNameById: 'SELECT id,user_name FROM sys_user WHERE id = ? ',
	checkUser: 'SELECT * FROM sys_user WHERE user_name = ? and pass_word = ?',
	into: 'insert into sys_user (user_name,pass_word,mail,creat_time) values(?,?,?,?)',
	edit: 'insert into article (author,user_id,title,context,tags,creat_time,modify_time) values(?,?,?,?,?,?,?)',
	updateEditById: 'UPDATE article SET reply = ?,title = ? , context = ? , tags = ? , modify_time = ? WHERE id = ?',
	getArticleById: "SELECT a.id,a.author,a.state,a.reply,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time FROM article a WHERE id = ? AND state = ?",
	getArticleOwner: 'SELECT a.id,a.state,a.user_id FROM article a WHERE id = ? AND user_id = ?',
	getReplyByArticleId: "SELECT a.id,su.user_name,a.article_id,a.from_user_id,a.content,a.creat_time FROM article_reply a LEFT JOIN sys_user su ON su.id = a.from_user_id WHERE article_id = ? order by creat_time desc limit ?,?",
	getReplyCount: 'SELECT COUNT(1) AS total FROM article_reply WHERE article_id = ?',
	getArticleByUserId: "SELECT a.id,a.author,a.state,a.reply,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time FROM article a WHERE user_id = ? AND state = ? order by creat_time desc limit ?,?",
	getArticleAll: "SELECT a.id,a.author,a.state,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time,af.follower FROM article a LEFT JOIN article_follow af on a.id = af.article_id WHERE a.state = ? order by creat_time desc limit ?,?",
	getArticleCount: 'SELECT COUNT(1) AS total FROM article WHERE state = ?',
	getArticleUserCount: 'SELECT COUNT(1) AS total FROM article WHERE user_id = ? AND state = ? ',
	getFollowLog: 'SELECT article_id,follower FROM article_follow WHERE article_id = ? ',
	intoFollowLog: 'insert into article_follow (article_id,user_id,type,follower,creat_time) values(?,?,?,?,?)',
	updateFollowLog: 'UPDATE article_follow SET follower = ? , creat_time = ? WHERE article_id = ?',
	intoLimitLog: 'insert into limited (api,method,ip,creat_time) values(?,?,?,?)',
	intoLimitBatchLog: 'INSERT INTO limited (api,method,ip,creat_time) VALUES ?',
	getKeyWords: 'SELECT context FROM keywords',
	updateUser: 'UPDATE sys_user SET token = ? WHERE id = ?',
	deleteArticleById: 'DELETE FROM article WHERE id = ? AND user_id = ?',
	deleteArticleByIdState: "UPDATE article SET state = ? WHERE id = ? AND user_id = ?",
	intoReplyLog: 'insert into article_reply (article_id,to_user_id,from_user_id,content,creat_time) values(?,?,?,?,?)',
	getSearchCount: 'SELECT COUNT(1) AS total FROM article a WHERE ( a.title LIKE ? OR a.context LIKE ? ) AND a.state = ?',
	getSearchMap: 'SELECT a.id,a.title,a.creat_time,a.tags FROM article a WHERE (a.title LIKE ? OR a.context LIKE ? ) AND a.state = ? order by creat_time desc limit ?,?',
	intoSearchLog: 'INSERT INTO article_search (keywords,total,creat_time,modify_time) values(?,?,?,?)',
	getSearchLog: 'SELECT id,total FROM article_search WHERE keywords = ?',
	updateSearchLog: 'UPDATE article_search SET total = ? , modify_time = ? WHERE id = ?',
	getSearchHots: 'SELECT a.id,a.keywords,a.total FROM article_search a WHERE a.keywords NOT LIKE "%*%" order by a.total desc limit 0,10',
	intoReplyByUser: 'INSERT INTO article_reply_to (reply_id,article_id,from_user_id,from_user_nick,to_user_id,content,creat_time) values(?,?,?,?,?,?,?)',
	getReplyByUser: 'SELECT ar.id,ar.reply_id,ar.from_user_id,ar.article_id,ar.to_user_id,ar.content,ar.from_user_nick,su.user_name to_user_nick,ar.creat_time FROM article_reply_to ar LEFT JOIN sys_user su on su.id = ar.to_user_id WHERE ar.reply_id = ? AND ar.article_id = ? order by creat_time desc limit 0,20',
	updateSomeThing: 'UPDATE article_reply_to ar SET ar.from_user_nick = (SELECT su.user_name FROM  sys_user su WHERE su.id = ar.from_user_id)',
	intoNoticeLog: 'INSERT INTO notice (key_id,from_user_id,to_user_id,context,type,state,creat_time) values(?,?,?,?,?,?,?)',
	updateNoticeLog: 'UPDATE notice SET state = ? WHERE id = ? AND to_user_id = ?',
	getNoticeLogByUserId: 'SELECT nt.id,nt.key_id,a.title,su.user_name,nt.from_user_id,nt.context,nt.state,nt.creat_time FROM notice nt LEFT JOIN sys_user su ON su.id = nt.from_user_id LEFT JOIN article a ON a.id = nt.key_id WHERE nt.to_user_id = ? AND nt.state = ? order by nt.creat_time desc limit ?,?',
	getNoticeLogCount: 'SELECT COUNT(1) AS total FROM notice WHERE to_user_id = ? AND state = ?',
	getArticleEsAll: "SELECT a.id,a.author,a.state,a.user_id,a.title,a.context,a.tags,a.creat_time,a.modify_time FROM article a WHERE a.state = ? order by creat_time desc",
	getArticleBulkIn: "SELECT * FROM article WHERE id IN(?) ",
	getArticleBulkOr: "SELECT * FROM article WHERE "
};

var {
	query
} = require('./db');

module.exports = {
	sysUser: sysUser,
	query: query
};