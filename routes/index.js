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
	formatDate,
	dateDiff,
	curryingCheck,
	isContain
} = require('../utils/index');

const {
	sendMails
} = require('../utils/sendMail');

const {
	MD5
} = require('../utils/crypto');

var checkUserName = curryingCheck('^[\u4E00-\u9FA5a-zA-Z0-9_]+$');
var checkMail = curryingCheck('^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$');

router.get('/', function(request, response) {
	let pageIndex = request.indexPage.pageIndex;
	let pageSize = request.indexPage.pageSize || 10;
	//console.log(request.checkUser)
	query(sysUser.getArticleCount, function(err, rows, fields) {
		if (err) {
			response.json({
				code: -101,
				msg: '数据库get-getArticleCount错误！'
			});
		} else {
			let totals = rows[0].total;
			let params = [{
				values: (pageIndex - 1) * pageSize
			}, {
				values: pageSize,
			}];
			query(sysUser.getArticleAll, function(err, rows, fields) {
				if (err) {
					response.json({
						code: -101,
						msg: '数据库get-getArticleAll错误！'
					});
				} else {
					response.render('index', {
						title: '首页',
						result: rows,
						fmt: formatDate,
						diff: dateDiff,
						token: request.session.token ? {
							userName: request.session.userName,
							userId: request.session.userId
						} : null,
						page: {
							total: totals,
							pageIndex: pageIndex,
							pageSize: pageSize,
							pageCount: Math.ceil(totals / pageSize)
						}
					})
				};
			}, params);
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
				if (rows[0].state == '1') {
					response.json({
						code: -303,
						msg: '账号已被封停，请联系客服'
					});
					return;
				}
				request.session.userName = rows[0].user_name;
				request.session.userId = rows[0].id;
				let tokens = sign({
					token: {
						lastLoginTime: +new Date(),
						isLogin: true,
						userId: rows[0].id,
						userName: rows[0].user_name
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

router.post('/', function(request, response) {

	let pageIndex = parseInt(request.body.pageIndex) || 1;
	let pageSize = parseInt(request.body.pageSize) || 10;

	query(sysUser.getArticleCount, function(err, rows, fields) {
		if (err) {
			response.json({
				code: -101,
				msg: '数据库getArticleCount错误！'
			});
		} else {
			let totals = rows[0].total;
			let params = [{
				values: (pageIndex - 1) * pageSize
			}, {
				values: pageSize,
			}];
			query(sysUser.getArticleAll, function(err, rows, fields) {
				if (err) {
					response.json({
						code: -101,
						msg: '数据库getArticleAll错误！'
					});
				} else {

					response.json({
						result: rows,
						code: 200,
						page: {
							total: totals,
							pageIndex: pageIndex,
							pageSize: pageSize,
							pageCount: Math.ceil(totals / pageSize)
						}
					})
				};
			}, params);
		};
	});

});


router.post('/logout', function(request, response) {
	request.session.destroy();
	response.clearCookie('_token');
	response.clearCookie('_checkToken');
	response.redirect('/');
});

router.post('/publish', function(request, response) {

	let params = [{
		values: request.checkUser.userName,
		column: 'author'
	}, {
		values: request.session.userId,
		column: 'user_id'
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
	if (!request.body.user_name || request.body.user_name == '' || !checkUserName(request.body.user_name) || request.body.user_name.length < 3) {
		response.json({
			code: -304,
			msg: '用户名错误或含有特殊字符或用户名位数不足3位以上',
			type: 'user_register_username_error'
		})
		return;
	}

	if (!request.body.pass_word || request.body.pass_word == '' || request.body.pass_word.length < 4) {
		response.json({
			code: -304,
			msg: '密码位数不足，4位以上',
			type: 'user_register_password_error'
		})
		return;
	}

	if (!request.body.mail || request.body.mail == '' || !checkMail(request.body.mail)) {
		response.json({
			code: -304,
			msg: '邮箱格式错误',
			type: 'user_register_mail_error'
		})
		return;
	}

	if (request.body.user_name && request.body.user_name != '') {
		query(sysUser.getUserByUserName, function(err, rows, fields) {
			if (err) {
				//console.log(err)
				response.json({
					code: -101,
					msg: '数据库getUserByUserName错误'
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
								msg: '数据库into错误'
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

router.post('/follow', function(request, response) {
	if (!request.session.token) {
		response.json({
			code: -305,
			msg: '未登录'
		});
		return;
	} else {
		let followed = parseInt(request.body.followed);
		let userId = parseInt(request.body.userId)
		let liker = parseInt(request.session.userId);
		//console.log(followed, userId, liker)
		query(sysUser.getArticleById, function(err, rows, fields) {
			if (err) {
				//console.log(err)
				response.json({
					code: -101,
					msg: '数据库getArticleById错误'
				})

			} else {
				if (rows.length <= 0) {
					response.json({
						code: -405,
						msg: '文章不存在'
					});
					return;
				} else {
					//console.log(rows[0])
					query(sysUser.getFollowLog, function(err1, rows1, fields) {
						if (err1) {
							//console.log(err1)
							response.json({
								code: -101,
								msg: '数据库getFollowLog错误'
							})

						} else {
							//console.log(rows1)
							if (rows1.length <= 0) {
								//新增点赞记录
								let params = [{
									values: followed,
									column: 'article_id'
								}, {
									values: userId,
									column: 'user_id',
								}, {
									values: 'like',
									column: 'type'
								}, {
									values: liker + ',',
									column: 'follower'
								}, {
									values: formatDate(),
									column: 'creat_time'
								}];
								query(sysUser.intoFollowLog, function(err2, rows2, fields) {
									if (err2) {
										//console.log(err2);
										response.json({
											code: -101,
											msg: '数据库intoFollowLog错误'
										})
									} else {
										response.json({
											code: 200,
											msg: '点赞成功'
										});
									}

								}, params);
							} else {
								//更新点赞记录
								let oldfollower = rows1[0].follower;
								if (oldfollower.indexOf(liker) <= -1) {

									oldfollower = oldfollower + liker + ',';

									let params = [{
										values: oldfollower,
										column: 'follower'
									}, {
										values: formatDate(),
										column: 'creat_time'
									}, {
										values: followed,
										column: 'article_id'
									}];

									query(sysUser.updateFollowLog, function(e, r, f) {
										if (e) {
											response.json({
												code: -101,
												msg: '数据库updateFollowLog错误'
											})
										} else {
											response.json({
												code: 200,
												msg: '更新点赞成功'
											});
										}

									}, params);
								} else {
									response.json({
										code: 200,
										msg: '更新点赞重复成功'
									});
								}


							}
						};
					}, followed);
				}
			};
		}, followed);
	}

})


router.post('/unfollow', function(request, response) {
	if (!request.session.token) {
		response.json({
			code: -305,
			msg: '未登录'
		});
		return;
	} else {
		let unfollowed = parseInt(request.body.unfollowed);
		let unliker = parseInt(request.session.userId);
		//console.log(unfollowed, userId, liker)
		query(sysUser.getArticleById, function(err, rows, fields) {
			if (err) {
				//console.log(err)
				response.json({
					code: -101,
					msg: '数据库unfollow-getArticleById错误'
				})
			} else {
				if (rows.length <= 0) {
					response.json({
						code: -405,
						msg: '文章不存在'
					});
					return;
				} else {
					query(sysUser.getFollowLog, function(err1, rows1, fields) {
						if (err1) {
							//console.log(err1)
							response.json({
								code: -101,
								msg: '数据库unfollow-getFollowLog错误'
							})
						} else {
							if (rows1.length <= 0) {
								response.json({
									code: -406,
									msg: '未关注，不需要取消关注'
								});
							} else {
								let old_follower = rows1[0].follower;
								if (old_follower.indexOf(unliker) <= -1) {
									response.json({
										code: -406,
										msg: '未关注，不需要取消关注'
									});
								} else {
									old_follower = old_follower.replace(`${unliker},`, '');
									let params = [{
										values: old_follower,
										column: 'follower'
									}, {
										values: formatDate(),
										column: 'creat_time'
									}, {
										values: unfollowed,
										column: 'article_id'
									}];

									query(sysUser.updateFollowLog, function(e, r, f) {
										if (e) {
											//console.log(e);
											response.json({
												code: -101,
												msg: '数据库unfollow-updateFollowLog错误'
											})

										} else {
											response.json({
												code: 200,
												msg: '点赞取消成功'
											});
										}

									}, params);
								}

							}
						};
					}, unfollowed);
				}
			};
		}, unfollowed);
	}

})
module.exports = router;