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
	checkMail
} = require('../utils/index');

const {
	sendMails
} = require('../utils/sendMail');

router.get('/', function(request, response) {
	response.render('index', {
		title: 'title'
	})
});

router.get('/login', function(request, response) {
	//console.log('login---->', request.session.token)
	response.render('login', {
		title: 'login'
	})
});

router.get('/send', function(request, response) {
	response.render('send', {
		title: 'send发送邮件'
	})
});

router.get('/data', function(request, response) {
	query(sysUser.getOne, function(err, rows, fields) {
		if (err) {
			//console.log(err)
			response.json({
				code: -101,
				result: [],
				msg: '权限不足'
			});
		} else {
			response.json({
				code: 200,
				result: rows,
				msg: 'success'
			});
		}

	}, request.pageObject)
});

router.get('/one', function(request, response) {
	let uid = request.query.uid;
	if (uid == '' || !uid) {
		response.json({
			code: -101,
			result: [],
			msg: '参数异常'
		});
		return;
	}
	query(sysUser.getUserByUserName, function(err, rows, fields) {
		if (err) {
			//console.log(err)
		} else {
			response.json({
				code: 200,
				result: rows,
				msg: 'success'
			});
		};
	}, uid);
});

router.post('/login', function(request, response) {
	//console.log(request.body.redirect)
	if (request.body.username == 'admin' && request.body.pwd == 'admin123') {
		request.session.userName = request.body.username;
		let tokens = sign({
			token: {
				lastLoginTime: +new Date(),
				isLogin: true,
			},
			option: {
				expiresIn: 60 * 15 // 15分钟过期
			}
		});
		request.session.token = tokens;
		response.cookie('_token', tokens, {
			httpOnly: true,
			maxAge: 60 * 1000 * 15, //有效期设置1分钟
		});
		//重定向redirect
		let redirect = !request.body.redirect || request.body.redirect == '' ? '/' : decodeURIComponent(request.body.redirect);
		response.redirect(redirect);
	} else {
		response.json({
			ret_code: 1,
			ret_msg: '账号或密码错误'
		});
	}
});


router.post('/logout', function(request, response) {
	request.session.destroy();
	response.clearCookie('_token');
	response.clearCookie('_checkToken');
	response.redirect('/login');
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