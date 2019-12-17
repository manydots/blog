const express = require('express');
const router = express.Router();
const {
	query
} = require('../utils/db');
const {
	sysUser
} = require('../utils/sql');
const {
	sign
} = require('../utils/jwt');
const {
	checkMail,
	formatDate
} = require('../utils/index');

const {
	sendMails
} = require('../utils/sendMail');

const {
	MD5
} = require('../utils/crypto');

router.get('/', function(request, response) {

	query(sysUser.getArticleAll, function(err, rows, fields) {
		if (err) {
			//console.log(err)
		} else {
			response.render('index', {
				title: '个人Blog',
				result: rows,
				fmt: formatDate
			})
		};
	});
});

router.get('/login', function(request, response) {
	//console.log('login---->', request.session.token)
	response.render('login', {
		title: 'login'
	})
});

router.get('/register', function(request, response) {
	//console.log('login---->', request.session.token)
	response.render('register', {
		title: 'register'
	})
});

router.get('/send', function(request, response) {
	response.render('send', {
		title: 'send发送邮件'
	})
});

router.get('/edit', function(request, response) {
	response.render('edit', {
		title: '发布文章'
	})
});

router.get('/a/:articleId', function(request, response) {
	//console.log(request.query)
	//let keys = Object.keys(request.params);
	//console.log(keys)

	query(sysUser.getArticleById, function(err, rows, fields) {
		if (err) {
			console.log(err)
		} else {
			if (rows.length <= 0) {
				response.render('error', {
					title: '文章不存在',
					result: '文章不存在'
				})
			} else {
				response.render('article', {
					title: rows[0].title,
					result: rows[0],
					fmt: formatDate
				})
			}
		};
	}, request.params.articleId);
});


router.post('/login', function(request, response) {
	//console.log(request.body.redirect)
	let params = [{
		values: request.body.user_name,
		column: 'user_name'
	}, {
		values: request.body.pass_word,
		column: 'pass_word',
		encryption: true
	}];
	if (request.body.user_name == '' || request.body.pass_word == '') {
		response.json({
			code: -303,
			msg: '账号或密码为空！'
		});
		return;
	}
	query(sysUser.checkUser, function(err, rows, fields) {
		if (err) {
			response.json({
				code: -101,
				msg: '数据库错误！'
			})
			//console.log(err)
		} else {
			if (rows.length <= 0) {
				response.json({
					code: -302,
					msg: '账号不存在或密码错误！'
				});
			} else {
				request.session.userName = request.body.username;
				let tokens = sign({
					token: {
						lastLoginTime: +new Date(),
						isLogin: true,
						userName: request.body.user_name
					},
					option: {
						expiresIn: 60 * 15 // 15分钟过期
					}
				});
				request.session.token = tokens;
				response.cookie('_token', tokens, {
					httpOnly: true,
					maxAge: 60 * 1000 * 15, //有效期设置15分钟
				});
				//重定向redirect
				let redirect = !request.body.redirect || request.body.redirect == '' ? '/' : decodeURIComponent(request.body.redirect);
				response.redirect(redirect);
			}
		};
	}, params);
});


router.post('/logout', function(request, response) {
	request.session.destroy();
	response.clearCookie('_token');
	response.clearCookie('_checkToken');
	response.redirect('/login');
});

router.post('/publish', function(request, response) {

	let params = [{
		values: request.checkUser.userName,
		column: 'author'
	}, {
		values: request.body.title,
		column: 'title',
	}, {
		values: request.body.context,
		column: 'context'
	}, {
		values: request.body.tags,
		column: 'tags'
	}, {
		values: formatDate(),
		column: 'creat_time'
	}, {
		values: formatDate(),
		column: 'modify_time'
	}];
	query(sysUser.edit, function(err, rows, fields) {
		if (err) {
			//console.log(err)
		} else {
			response.json({
				code: 200,
				msg: '发布成功！'
			});
		};
	}, params)

})

router.post('/register', function(request, response) {
	//console.log(request.body)

	if (request.body.user_name && request.body.user_name != '') {
		query(sysUser.getUserByUserName, function(err, rows, fields) {
			if (err) {
				//console.log(err)
				response.json({
					code: -101,
					msg: '数据库错误'
				})
				return;
			} else {
				//console.log(rows)
				if (rows.length <= 0) {
					let params = [{
						values: request.body.user_name,
						column: 'user_name'
					}, {
						values: request.body.pass_word,
						column: 'pass_word',
						encryption: true
					}, {
						values: request.body.mail,
						column: 'mail'
					}, {
						values: formatDate(),
						column: 'creat_time'
					}];
					query(sysUser.into, function(err, rows, fields) {
						if (err) {
							response.json({
								code: -101,
								msg: '数据库错误'
							})
							//console.log(err)
						} else {
							response.json({
								code: 200,
								msg: '注册成功'
							})
						};
					}, params);
				} else {
					response.json({
						code: -301,
						msg: '用户已存在'
					})
				}

			};
		}, request.body.user_name);
	}

});

router.post('/sendMail', function(request, response) {
	let to = request.body.to;
	let sendHtml = request.body.sendHtml;
	if (to == '' || sendHtml == '') {
		response.json({
			code: -102,
			msg: '部分参数为空'
		});
		return;
	} else {
		if (!checkMail(to)) {
			response.json({
				code: -102,
				msg: '邮箱格式错误'
			});
		} else {
			sendMails(to, sendHtml, function(res) {
				if (res && res.response.indexOf('250 Ok') > -1) {
					response.json({
						code: 0,
						msg: '邮件发送成功'
					});
				} else {
					response.json({
						code: -103,
						msg: '邮件发送失败'
					});
				}
			})
		}

	}

});

module.exports = router;