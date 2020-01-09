const express = require('express');
const router = express.Router();
const { sysUser,query } = require('../utils/sql');
const { sign,verify } = require('../utils/jwt');
const { cookieMaxAge } = require('../utils/config');
const { formatDate,dateDiff,curryingCheck} = require('../utils/index');
const { sendMails } = require('../utils/sendMail');
var emoji = require('node-emoji');
var checkUserName = curryingCheck('^[\u4E00-\u9FA5a-zA-Z0-9_]+$');
var checkMail = curryingCheck('^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$');

router.get('/', async (request, response) => {
	let pageIndex = request.indexPage.pageIndex;
	let pageSize = request.indexPage.pageSize || 10;

	//同步请求
	let totals = await query({
		sql: sysUser.getArticleCount,
		params: '0',
		res: response
	});
	let hots = await query({sql:sysUser.getSearchHots,res:response});
	let rowCounts = totals && totals[0] && totals[0].total != '' && totals[0].total != null ? totals[0].total : 0;
	let params = [{
		values: '0',
	}, {
		values: (pageIndex - 1) * pageSize
	}, {
		values: pageSize,
	}];

	query({
		sql: sysUser.getArticleAll,
		params: params,
		res: response
	}).then(function(rows) {
		response.render('index', {
			title: 'Blogers, Where Are You.',
			result: rows,
			fmt: formatDate,
			diff: dateDiff,
			hots:hots,
			emoji:emoji,
			token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
				userName: request.session.userName,
				userId: request.session.userId
			} : null,
			page: {
				total: rowCounts,
				pageIndex: pageIndex,
				pageSize: pageSize,
				pageCount: Math.ceil(rowCounts / pageSize)
			}
		})
	})
});

router.get('/test', async (request, response) => {
	response.render('test', {
		emoji:emoji,
		title: '临时测试路由 :punch: ~~~',
		result: '临时测试路由 <em>高亮字符</em> :punch: ~~~',
	})
})

router.get('/login', function(request, response) {
	//console.log('login---->', request.session.token)
	response.render('login', {
		title: '登录账号',
		token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
			userName: request.session.userName,
			userId: request.session.userId
		} : null,
	})
});

router.get('/register', function(request, response) {
	//console.log('register---->', request.session.token)
	response.render('register', {
		title: '注册账号',
		token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
			userName: request.session.userName,
			userId: request.session.userId
		} : null,
	})
});

router.get('/send', function(request, response) {
	response.render('send', {
		title: '发送邮件',
		token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
			userName: request.session.userName,
			userId: request.session.userId
		} : null,
	})
});

router.get('/edit', function(request, response) {
	//中间件已拦截登录状态，故不需要判断登录状态
	//console.log(request.query.id,request.query.state)
	if (request.query.id && request.query.id != '' && request.query.state && request.query.state != '') {
		query({
			sql: sysUser.getArticleOwner,
			params: [{
				values: request.query.id
			}, {
				values: request.session.userId
			}],
			res: response
		}).then(function(rows) {
			if (rows.length == 0) {
				response.json({
					code: -407,
					msg: '文章权限异常'
				});
				return;
			} else {
				query({
					sql: sysUser.getArticleById,
					params: [{
						values: request.query.id
					}, {
						values: request.query.state
					}],
					res: response
				}).then(function(rows) {
					response.render('edit', {
						title: '修改文章',
						result: rows[0],
						token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
							userName: request.session.userName,
							userId: request.session.userId
						} : null,
					})
				})
			}
		})
	} else {
		response.render('edit', {
			title: '发布文章',
			result: null,
			token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
				userName: request.session.userName,
				userId: request.session.userId
			} : null,
		})
	}


});

router.get('/a/:articleId', async (request, response) => {
	//let keys = Object.keys(request.params);

	let hots = await query({
		sql: sysUser.getArticleAll,
		params: [{
			values: '0',
		}, {
			values: 0
		}, {
			values: 3
		}]
	});
	let pageIndex = parseInt(request.query.p) || 1;
	let pageSize = parseInt(request.query.s) || 5;
	let totals = await query({
		sql: sysUser.getReplyCount,
		params: request.params.articleId,
		res: response
	});
	let rowCounts = totals && totals[0] && totals[0].total != '' && totals[0].total != null ? totals[0].total : 0;
	query({
		sql: sysUser.getArticleById,
		params: [{
			values: request.params.articleId
		}, {
			values: '0'
		}],
		res: response
	}).then(function(rows) {
		//console.log(hots.length)
		if (rows.length <= 0) {
			response.render('error', {
				title: '文章不存在',
				result: '文章不存在',
				replyMap: null,
				page:null,
				status:null,
				fmt: formatDate,
				diff: dateDiff,
				emoji:emoji,
				token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
					userName: request.session.userName,
					userId: request.session.userId
				} : null,
			})
		} else {
			if (rows[0].reply == '0') {
				query({
					sql: sysUser.getReplyByArticleId,
					params: [{
						values: request.params.articleId
					}, {
						values: (pageIndex - 1) * pageSize
					}, {
						values: pageSize,
					}]
				}).then(function(row1) {
					response.render('article', {
						title: rows[0].title,
						result: rows[0],
						hotsList: hots,
						fmt: formatDate,
						diff: dateDiff,
						replyMap: row1,
						emoji:emoji,
						page: {
							total: rowCounts,
							pageIndex: pageIndex,
							pageSize: pageSize,
							pageCount: Math.ceil(rowCounts / pageSize)
						},
						token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
							userName: request.session.userName,
							userId: request.session.userId
						} : null,
					})
				})
			} else {
				response.render('article', {
					title: rows[0].title,
					result: rows[0],
					hotsList: hots,
					fmt: formatDate,
					diff: dateDiff,
					emoji:emoji,
					replyMap: null,
					page:null,
					token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
						userName: request.session.userName,
						userId: request.session.userId
					} : null,
				})
			}
		}
	})
});

router.get('/news/:userId', async (request, response) => {

	let state = request.query.st && request.query.st != '' && request.query.st != undefined ? request.query.st : '1';
	let tips = '已读消息';
	if (state == '1') {
		tips = '未读消息'
	};

	if (!request.session.token) {
		response.redirect('/login');
		return;
	} else {
		if (request.params.userId == request.session.userId) {
			let userId = parseInt(request.params.userId);
			let pageIndex = parseInt(request.query.p) || 1;
			let pageSize = parseInt(request.query.s) || 5;
			let totals = await query({
				sql: sysUser.getNoticeLogCount,
				params: [{
					values: userId
				}, {
					values: state
				}],
				res:response
			});
			let rowCounts = totals && totals[0] && totals[0].total != '' && totals[0].total != null ? totals[0].total : 0;
			query({
				sql: sysUser.getNoticeLogByUserId,
				params: [{
					values: userId
				}, {
					values: state
				}, {
					values: (pageIndex - 1) * pageSize
				}, {
					values: pageSize
				}]
			}).then(function(rows) {
				response.render('news', {
					title: `消息记录-${tips}`,
					tips: tips,
					result: rows,
					fmt: formatDate,
					state:state,
					page: {
						total: rowCounts,
						pageIndex: pageIndex,
						pageSize: pageSize,
						pageCount: Math.ceil(rowCounts / pageSize)
					},
					token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
						userName: request.session.userName,
						userId: request.session.userId
					} : null,
				});
			});
			
		} else {
			console.log('路由news用户不匹配,切换到首页');
			response.redirect('/');
			return;
		}
	}

});

router.get('/al/:userId', async (request, response) => {
	if (!request.session.token) {
		response.redirect('/login');
		return;
	} else {
		if (request.params.userId == request.session.userId) {
			let pageIndex = parseInt(request.query.p) || 1;
			let pageSize = parseInt(request.query.s) || 5;
			//同步请求
			let totals = await query({
				sql: sysUser.getArticleUserCount,
				params: [{
					values: request.session.userId
				}, {
					values: '0'
				}],
				res: response
			});
			let rowCounts = totals && totals[0] && totals[0].total != '' && totals[0].total != null ? totals[0].total : 0;
			console.log(`用户编号:[${request.session.userId}],个人文章总数:[${rowCounts}]`);
			query({
				sql: sysUser.getArticleByUserId,
				params: [{
					values: request.session.userId
				}, {
					values: '0'
				}, {
					values: (pageIndex - 1) * pageSize
				}, {
					values: pageSize
				}],
				res: response
			}).then(function(rows) {
				response.render('al', {
					title: '已发布-文章列表',
					result: rows,
					fmt: formatDate,
					page: {
						total: rowCounts,
						pageIndex: pageIndex,
						pageSize: pageSize,
						pageCount: Math.ceil(rowCounts / pageSize)
					},
					token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
						userName: request.session.userName,
						userId: request.session.userId
					} : null,
				});
			})

		} else {
			console.log('路由al用户不匹配,切换到首页');
			response.redirect('/');
			return;
		}
	}

});

router.get('/ad/:userId', async (request, response) => {
	if (!request.session.token) {
		response.redirect('/login');
		return;
	} else {
		if (request.params.userId == request.session.userId) {
			let pageIndex = parseInt(request.query.p) || 1;
			let pageSize = parseInt(request.query.s) || 5;
			//同步请求
			let totals = await query({
				sql: sysUser.getArticleUserCount,
				params: [{
					values: request.session.userId
				}, {
					values: '1'
				}],
				res: response
			});
			let rowCounts = totals && totals[0] && totals[0].total != '' && totals[0].total != null ? totals[0].total : 0;
			console.log(`用户编号:[${request.session.userId}],个人回收站文章总数:[${rowCounts}]`);
			query({
				sql: sysUser.getArticleByUserId,
				params: [{
					values: request.session.userId
				}, {
					values: '1'
				}, {
					values: (pageIndex - 1) * pageSize
				}, {
					values: pageSize
				}],
				res: response
			}).then(function(rows) {
				response.render('ad', {
					title: '回收站-文章列表',
					result: rows,
					fmt: formatDate,
					page: {
						total: rowCounts,
						pageIndex: pageIndex,
						pageSize: pageSize,
						pageCount: Math.ceil(rowCounts / pageSize)
					},
					token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
						userName: request.session.userName,
						userId: request.session.userId
					} : null,
				});
			})

		} else {
			console.log('路由ad用户不匹配,切换到首页');
			response.redirect('/');
			return;
		}
	}

});

router.get('/token/:tokens', function(request, response) {
	let tokens = request.params.tokens;
	if (tokens && tokens != '') {
		verify(tokens, function(err, decode) {
			if (err) {
				response.render('token', {
					title: '邮箱激活-邮件已过期',
					code: -504,
					msg: '邮件已过期',
					token: null
				})
			} else {
				let params = [{
					values: 'SUCCESS',
					column: 'token'
				}, {
					values: decode.userId,
					column: 'id'
				}];
				query({
					sql: sysUser.updateUser,
					params: params,
					res: response
				}).then(function(rows) {
					response.render('token', {
						title: '邮箱已激活-邮箱激活成功',
						code: 200,
						msg: '邮箱激活成功！',
						token: decode
					});
				})
			}
		})
	} else {
		response.render('token', {
			code: -501,
			title: '邮箱激活-参数异常',
			msg: '参数异常',
			token: null
		})
	}
});

router.get('/search', async (request, response) => {
	let pageIndex = parseInt(request.query.p) || 1;
	let pageSize = parseInt(request.query.s) || 5;
	let keyWords = request.query.k || '';
	let hots = await query({sql:sysUser.getSearchHots,res:response});
	//`%${keyWords}%`
	if (keyWords && keyWords != '') {
		if (keyWords.length > 50) {
			response.render('search', {
				title: `关键词[${keyWords}]50字以下`,
				code: 200,
				keywords: keyWords,
				result: null,
				page: null,
				hots:hots,
				fmt: formatDate,
				diff: dateDiff,
				token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
					userName: request.session.userName,
					userId: request.session.userId
				} : null
			});
			return;
		};
		query({
			sql: sysUser.getSearchLog,
			params: [{
				values: keyWords,
				filterKeyWords: request.keywords,
				column: 'keywords'
			}]
		}).then(function(rows) {
			if (!rows[0] || !rows[0].total) {
				query({
					sql: sysUser.intoSearchLog,
					params: [{
						values: keyWords,
						filterKeyWords: request.keywords,
						column: 'keywords'
					}, {
						values: 1,
						column: 'total'
					}, {
						values: formatDate(),
						column: 'creat_time'
					}, {
						values: formatDate(),
						column: 'modify_time'
					}],
					res: response
				}).then(function(res) {
					console.log(`关键词:[${keyWords}],总数:[1];搜索日志插入成功!`);
				});
			} else {
				query({
					sql: sysUser.updateSearchLog,
					params: [{
						values: rows[0].total + 1
					}, {
						values: formatDate()
					}, {
						values: rows[0].id
					}],
					res: response
				}).then(function(res) {
					console.log(`关键词:[${keyWords}],总数:[${rows[0].total+1}];搜索日志更新成功!`);
				})

			}
		})
	} else {
		response.render('search', {
			title: `关键词为空`,
			code: 200,
			keywords: keyWords,
			result: null,
			page: null,
			hots:hots,
			fmt: formatDate,
			diff: dateDiff,
			token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
				userName: request.session.userName,
				userId: request.session.userId
			} : null
		});
		return;
	}
	query({
		sql: sysUser.getSearchCount,
		params: [{
			values: `%${keyWords}%`
		}, {
			values: `%${keyWords}%`
		}, {
			values: '0'
		}],
		res: response
	}).then(function(res) {
		let rowCounts = res[0].total && res[0].total != '' && res[0].total != null ? res[0].total : 0;
		if (rowCounts <= 0 || keyWords == '') {
			response.render('search', {
				title: `暂未查询到关键词[${keyWords}]结果`,
				code: 200,
				keywords: keyWords,
				result: null,
				page: null,
				hots:hots,
				fmt: formatDate,
				diff: dateDiff,
				token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
					userName: request.session.userName,
					userId: request.session.userId
				} : null
			});
		} else {
			query({
				sql: sysUser.getSearchMap,
				params: [{
					values: `%${keyWords}%`
				}, {
					values: `%${keyWords}%`
				}, {
					values: '0'
				}, {
					values: (pageIndex - 1) * pageSize
				}, {
					values: pageSize
				}],
				res: response
			}).then(function(rows) {
				response.render('search', {
					title: `查询到关键词[${keyWords}]结果`,
					code: 200,
					result: rows,
					keywords: keyWords,
					fmt: formatDate,
					diff: dateDiff,
					hots:hots,
					page: {
						total: rowCounts,
						pageIndex: pageIndex,
						pageSize: pageSize,
						pageCount: Math.ceil(rowCounts / pageSize)
					},
					token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
						userName: request.session.userName,
						userId: request.session.userId
					} : null
				});
			})
		}
	})
});

//elasticsearch全文关键词检索
router.get('/s', async (request, response) => {
	let keyWords = request.query.k || '';
	let pageSize = parseInt(request.query.s) || 5;
	let pageIndex = parseInt(request.query.p) || 1;

	if (keyWords && keyWords != '' && response.esClient) {
		if (keyWords.length > 30) {
			response.render('s', {
				title: `关键词过长30字以下`,
				code: 201,
				keywords: keyWords,
				result: null,
				page: null,
				ms: 0,
				emoji: emoji,
				fmt: formatDate,
				diff: dateDiff,
				token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
					userName: request.session.userName,
					userId: request.session.userId
				} : null
			});
			return;
		};
		query({
			sql: sysUser.getSearchLog,
			params: [{
				values: keyWords,
				filterKeyWords: request.keywords,
				column: 'keywords'
			}]
		}).then(function(rows) {
			if (!rows[0] || !rows[0].total) {
				query({
					sql: sysUser.intoSearchLog,
					params: [{
						values: keyWords,
						filterKeyWords: request.keywords,
						column: 'keywords'
					}, {
						values: 1,
						column: 'total'
					}, {
						values: formatDate(),
						column: 'creat_time'
					}, {
						values: formatDate(),
						column: 'modify_time'
					}],
					res: response
				}).then(function(res) {
					console.log(`关键词:[${keyWords}],总数:[1];搜索日志插入成功!`);
				});
			} else {
				query({
					sql: sysUser.updateSearchLog,
					params: [{
						values: rows[0].total + 1
					}, {
						values: formatDate()
					}, {
						values: rows[0].id
					}],
					res: response
				}).then(function(res) {
					console.log(`关键词:[${keyWords}],总数:[${rows[0].total+1}];搜索日志更新成功!`);
				})

			}
		})

	} else {
		response.render('s', {
			title: `关键词为空`,
			code: 200,
			result: null,
			fmt: formatDate,
			diff: dateDiff,
			ms: 0,
			emoji: emoji,
			keywords: keyWords,
			token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
				userName: request.session.userName,
				userId: request.session.userId
			} : null,
			page: null
		});
		return;
	}
	let body = {
		size: pageSize,
		from: (pageIndex - 1) * pageSize,
		query: {
			multi_match: {
				query: keyWords,
				fields: ["title", "context", "tags", "author"]
			}
		},
		highlight: {
			pre_tags: ["<em>"],
			post_tags: ["</em>"],
			fields: {
				title: {},
				context: {},
				tags: {},
				author: {}
			}
		}
	};
	response.esClient.search({
		index: 'blog_article',
		body: body
	}).then(function(results) {
		let rowCounts = results.hits.total.value;
		console.log(`索引[blog_article],关键词[${keyWords}],总条数[${rowCounts}],耗时[${results.took}ms]`);
		//console.log(results.hits.hits)
		response.render('s', {
			title: `查询到关键词[${keyWords}]结果`,
			code: 200,
			result: results.hits.hits,
			fmt: formatDate,
			diff: dateDiff,
			emoji: emoji,
			ms: results.took,
			keywords: keyWords,
			token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
				userName: request.session.userName,
				userId: request.session.userId
			} : null,
			page: {
				total: rowCounts,
				pageIndex: pageIndex,
				pageSize: pageSize,
				pageCount: Math.ceil(rowCounts / pageSize)
			}
		});
	})
});

router.post('/login', function(request, response) {
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
	};
	query({
		sql: sysUser.checkUser,
		params: params,
		res: response
	}).then(function(rows) {
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
			if (rows[0].token == null || rows[0].token == '') {
				let _tokenMail = sign({
					token: {
						userId: rows[0].id,
						mail: rows[0].mail,
						userName: rows[0].user_name,
					},
					option: {
						expiresIn: 60 * 15 // 15分钟过期
					}
				});
				//console.log(_tokenMail);
				//https://blog.jeeas.cn
				let visitUrl = request.headers.origin.indexOf('127.0.0.1') > -1 ? 'http://127.0.0.1:3035' : 'https://blog.jeeas.cn';
				let sendHtml = `<a class="nav-link" href="${visitUrl}/token/${_tokenMail}" target="_blank">点击激活，15分钟有效</a>`;
				sendMails(rows[0].mail, sendHtml, function(res) {
					if (res && res.response.includes('250 Ok')) {
						console.log('激活邮件发送成功')
					} else {
						console.log('激活邮件发送失败')
					}
				});
				response.json({
					code: -304,
					msg: `邮箱未激活！请激活后重试！邮件已发送到${rows[0].mail}，15分钟内有效`,
					token: {
						mail: rows[0].mail
					}
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
					expiresIn: 60 * cookieMaxAge // 15分钟过期
				}
			});
			request.session.token = tokens;
			response.cookie('_token', tokens, {
				httpOnly: true,
				maxAge: 60 * 1000 * 15, //有效期设置15分钟
			});
			//重定向redirect
			//let redirect = !request.body.redirect || request.body.redirect == '' ? '/' : decodeURIComponent(request.body.redirect);
			//response.redirect(redirect);
			response.json({
				code: 200,
				msg: '登录操作成功'
			});
		}
	})
});

router.post('/loginout', function(request, response) {
	request.checkUser = undefined;
	request.session.destroy();
	response.clearCookie('_token');
	response.clearCookie('_checkToken');
	//response.redirect('/');
	response.json({
		code: 200,
		msg: '操作成功'
	});
});

router.post('/publish', function(request, response) {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	};
	if (request.body.title == '' || request.body.context == '') {
		response.json({
			code: -408,
			msg: '部分字段异常请检查后重试！'
		});
		return;
	};
	let params = [{
		values: request.checkUser.userName,
		column: 'author'
	}, {
		values: request.session.userId,
		column: 'user_id'
	}, {
		values: request.body.title,
		filterKeyWords: request.keywords,
		column: 'title',
	}, {
		values: request.body.context,
		filterKeyWords: request.keywords,
		column: 'context'
	}, {
		values: request.body.tags,
		filterKeyWords: request.keywords,
		column: 'tags'
	}, {
		values: formatDate(),
		column: 'creat_time'
	}, {
		values: formatDate(),
		column: 'modify_time'
	}];
	query({
		sql: sysUser.edit,
		type: 'es-article-publish',
		params: params,
		res: response
	}).then(function(rows) {
		//console.log(rows.insertId)

		//变动文章放到rabbitMQ队列等待批量更新
		if (response.rabbitMQ) {
			let _params = {
				id: rows.insertId,
				type: 'es-article-publish'
			};
			response.rabbitMQ.sendQueueMsg('esArticleQueue', _params, (text) => {
				if (text == 'success') {
					console.log(`[send-esArticleQueue]:success.`);
				}
			});
		};
		response.json({
			code: 200,
			msg: '文章发布成功！'
		});
	});
})

router.post('/edits', function(request, response) {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		query({
			sql: sysUser.getArticleOwner,
			type:'es-article-update',
			params: [{
				values: request.body.id
			}, {
				values: request.session.userId
			}],
			res: response
		}).then(function(rows) {
			if (rows.length == 0) {
				response.json({
					code: -407,
					msg: '文章权限异常'
				});
				return;
			} else {
				if (request.body.title == '' || request.body.context == '' || request.body.id == '') {
					response.json({
						code: -408,
						msg: '部分字段异常请检查后重试！'
					});
					return;
				};
				query({
					sql: sysUser.updateEditById,
					params: [{
						values: request.body.reply || '0',
					},{
						values: request.body.title,
						filterKeyWords: request.keywords,
					}, {
						values: request.body.context,
						filterKeyWords: request.keywords,
					}, {
						values: request.body.tags,
						filterKeyWords: request.keywords,
					}, {
						values: formatDate()
					}, {
						values: request.body.id
					}],
					res: response
				}).then(function(res) {

					//变动文章放到rabbitMQ队列等待批量更新
					if (response.rabbitMQ) {
						let _params = {
							id: request.body.id,
							type: 'es-article-update'
						};
						response.rabbitMQ.sendQueueMsg('esArticleQueue', _params, (text) => {
							if (text == 'success') {
								console.log(`[send-esArticleQueue]:success.`);
							}
						});
					};
					response.json({
						code: 200,
						msg: '文章更新成功！'
					});
				})
			}
		});
	}
})

router.post('/register', function(request, response) {
	//console.log(request.body)
	if (!request.body.user_name || request.body.user_name == '' || !checkUserName(request.body.user_name) || request.body.user_name.length < 3) {
		response.json({
			code: -302,
			msg: '用户名错误或含有特殊字符或用户名位数不足3位以上',
			type: 'user_register_username_error'
		})
		return;
	}

	if (!request.body.pass_word || request.body.pass_word == '' || request.body.pass_word.length < 4) {
		response.json({
			code: -303,
			msg: '密码位数不足，4位以上',
			type: 'user_register_password_error'
		})
		return;
	}
	let isContainKeyWord = false;
	if (request.body.user_name) {
		for (let v of request.keywords) {
			if (request.body.user_name.includes(v)) {
				isContainKeyWord = true;
				break;
			}
		}
	}
	if (isContainKeyWord) {
		response.json({
			code: -304,
			msg: '用户名包含敏感字符',
			type: 'user_register_username_error'
		});
		return;
	}

	if (!request.body.mail || request.body.mail == '' || !checkMail(request.body.mail)) {
		response.json({
			code: -305,
			msg: '邮箱格式错误',
			type: 'user_register_mail_error'
		})
		return;
	}

	if (request.body.user_name && request.body.user_name != '') {
		query({
			sql: sysUser.getUserByUserName,
			params: request.body.user_name,
			res: response
		}).then(function(rows) {
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
				query({
					sql: sysUser.into,
					params: params,
					res: response
				}).then(function(rows) {
					response.json({
						code: 200,
						msg: `账号注册成功！激活邮件在登录时发送到${request.body.mail}`
					})
				})
			} else {
				response.json({
					code: -301,
					msg: '用户已存在'
				})
			}
		})
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
				if (res && res.response.includes('250 Ok')) {
					response.json({
						code: 200,
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
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		let followed = parseInt(request.body.followed);
		let userId = parseInt(request.body.userId)
		let liker = parseInt(request.session.userId);
		let state = request.body.state || '0';
		//console.log(followed, userId, liker)
		query({
			sql: sysUser.getArticleById,
			params: [{
				values: followed
			}, {
				values: state
			}],
			res: response
		}).then(function(rows) {
			if (rows.length <= 0) {
				response.json({
					code: -405,
					msg: '文章不存在'
				});
				return;
			} else {
				//console.log(rows[0])
				query({
					sql: sysUser.getFollowLog,
					params: followed,
					res: response
				}).then(function(rows1) {
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
						query({
							sql: sysUser.intoFollowLog,
							params: params,
							res: response
						}).then(function(res) {
							response.json({
								code: 200,
								msg: '点赞成功'
							});
						})
					} else {
						//更新点赞记录
						let oldfollower = rows1[0].follower;
						if (!oldfollower.includes(liker)) {
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

							query({
								sql: sysUser.updateFollowLog,
								params: params,
								res: response
							}).then(function(res) {
								response.json({
									code: 200,
									msg: '更新点赞成功'
								});
							})
						} else {
							response.json({
								code: 200,
								msg: '更新点赞重复成功'
							});
						}
					}
				})
			}
		})
	}
})

router.post('/unfollow', function(request, response) {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		let unfollowed = parseInt(request.body.unfollowed);
		let unliker = parseInt(request.session.userId);
		let state = request.body.state || '0';
		//console.log(unfollowed, userId, liker)
		query({
			sql: sysUser.getArticleById,
			params: [{
				values: unfollowed
			}, {
				values: state
			}],
			res: response
		}).then(function(rows) {
			if (rows.length <= 0) {
				response.json({
					code: -405,
					msg: '文章不存在'
				});
				return;
			} else {
				query({
					sql: sysUser.getFollowLog,
					params: unfollowed,
					res: response
				}).then(function(rows1) {
					if (rows1.length <= 0) {
						response.json({
							code: -406,
							msg: '未关注，不需要取消关注'
						});
					} else {
						let old_follower = rows1[0].follower;
						if (!old_follower.includes(unliker)) {
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
							query({
								sql: sysUser.updateFollowLog,
								params: params,
								res: response
							}).then(function(res) {
								response.json({
									code: 200,
									msg: '点赞取消成功'
								});
							})
						}
					}
				})
			}
		})
	}
});

router.post('/deleteArticle', async (request, response) => {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		//console.log(request.body.id);
		query({
			sql: sysUser.getArticleOwner,
			params: [{
				values: request.body.id
			}, {
				values: request.session.userId
			}],
			res: response
		}).then(function(rows) {
			if (rows.length == 0) {
				response.json({
					code: -407,
					msg: '文章权限异常'
				});
				return;
			} else {
				let state = request.body.state || '1';
				query({
					sql: sysUser.deleteArticleByIdState,
					params: [{
						values: state
					}, {
						values: request.body.id
					}, {
						values: request.session.userId
					}],
					res: response
				}).then(function(res) {
					response.json({
						code: 200,
						msg: '文章状态更新成功！'
					});
				})
			}
		});
	}
});

router.post('/deleteForever', async (request, response) => {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		//console.log(request.body.id);
		query({
			sql: sysUser.getArticleOwner,
			params: [{
				values: request.body.id
			}, {
				values: request.session.userId
			}],
			res: response
		}).then(function(rows) {
			if (rows.length == 0) {
				response.json({
					code: -407,
					msg: '文章权限异常'
				});
				return;
			} else {
				query({
					sql: sysUser.deleteArticleById,
					params: [{
						values: request.body.id
					}, {
						values: request.session.userId
					}],
					res: response
				}).then(function(res) {
					response.json({
						code: 200,
						msg: '文章永久删除成功！'
					});
				})
			}
		});
	}
});


router.post('/reply', async (request, response) => {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		let articleId = parseInt(request.body.id);
		let userId = request.session.userId;
		let content = request.body.reply;
		if (!articleId || articleId == '' || !content || content == '') {
			response.json({
				code: -409,
				msg: '评论内容参数异常！请检查后重试'
			});
			return;
		} else if (content.length > 120) {
			response.json({
				code: -412,
				msg: '评论内容过长！'
			});
			return;
		}

		query({
			sql: sysUser.getArticleById,
			params: [{
				values: articleId
			}, {
				values: '0'
			}],
			res: response
		}).then(function(rows) {
			if (rows.length <= 0) {
				response.json({
					code: -405,
					msg: '文章不存在'
				});
				return;
			} else {
				let timer = formatDate();
				query({
					sql: sysUser.intoReplyLog,
					params: [{
						values: articleId,
						column: 'article_id'
					}, {
						values: rows[0].user_id,
						column: 'to_user_id'
					}, {
						values: userId,
						column: 'from_user_id'
					}, {
						values: content,
						filterKeyWords: request.keywords,
						column: 'content',
					}, {
						values: timer,
						column: 'creat_time'
					}],
					res: response
				}).then(function(res) {
					query({
						sql: sysUser.intoNoticeLog,
						params: [{
							values: articleId,
							column: 'article_id_key'
						}, {
							values: userId,
							column: 'from_user_id'
						}, {
							values: rows[0].user_id,
							column: 'to_user_id'
						}, {
							values: content,
							filterKeyWords: request.keywords,
							column: 'content',
						}, {
							values: 'replyBy',
							column: 'type'
						}, {
							values: '1',
							column: 'state'
						}, {
							values: timer,
							column: 'creat_time'
						}]
					});
					response.json({
						code: 200,
						msg: '评论成功！'
					});
				})
			}
		})
	}
})

router.post('/getReply', async (request, response) => {
	let replyId = parseInt(request.body.replyId);
	let articleId = parseInt(request.body.articleId);
	query({
		sql: sysUser.getReplyByUser,
		params: [{
			values: replyId
		}, {
			values: articleId
		}],
		res: response
	}).then(function(rows) {
		response.json({
			code: 200,
			result: rows
		});
	})
});

router.post('/replyTo', async (request, response) => {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		let content = request.body.content;
		let replyId = parseInt(request.body.replyId);
		let articleId = parseInt(request.body.articleId);
		let toUserId = parseInt(request.body.toUserId);
		let userId = request.session.userId;
		//未做文章校验
		//console.log(content, replyId, articleId, toUserId, userId)
		if (!content || content == '') {
			response.json({
				code: -410,
				msg: '回复评论内容为空！'
			});
			return;
		} else if (content.length > 120) {
			response.json({
				code: -411,
				msg: '回复评论内容过长！'
			});
			return;
		};
		query({
			sql: sysUser.getUserNameById,
			params: userId
		}).then(function(rows) {
			if (rows.length > 0) {
				let timer = formatDate();
				query({
					sql: sysUser.intoReplyByUser,
					params: [{
						values: replyId,
					}, {
						values: articleId,
					}, {
						values: userId,
					}, {
						values: rows[0].user_name,
					}, {
						values: toUserId,
					}, {
						values: content,
						filterKeyWords: request.keywords,
						column: 'content',
					}, {
						values: timer,
					}],
					res: response
				}).then(function(res) {
					query({
						sql: sysUser.intoNoticeLog,
						params: [{
							values: articleId,
							column: 'article_id_key'
						}, {
							values: userId,
							column: 'from_user_id'
						}, {
							values: toUserId,
							column: 'to_user_id'
						}, {
							values: content,
							filterKeyWords: request.keywords,
							column: 'content',
						}, {
							values: 'replyTo',
							column: 'type'
						}, {
							values: '1',
							column: 'state'
						}, {
							values: timer,
							column: 'creat_time'
						}]
					});
					response.json({
						code: 200,
						msg: '回复评论成功！'
					});
				})
			}
		})

	}
});

router.post('/read', async (request, response) => {
	if (!request.session.token) {
		response.json({
			code: -306,
			msg: '未登录'
		});
		return;
	} else {
		let readId = parseInt(request.body.readId);
		let state = parseInt(request.body.state);
		let userId = request.session.userId;
		query({
			sql: sysUser.updateNoticeLog,
			params: [{
				values: state
			}, {
				values: readId
			}, {
				values: userId
			}],
			res: response
		}).then(function(rows) {
			response.json({
				code: 200,
				result: '消息状态标记成功！'
			});
		})
	}

});

//异常路由处理
router.get('*', function(request, response) {
	if (!request.url.includes('/favicon.ico')) {
		console.log(`page 404 error:[${request.url}]`);
		response.render('error', {
			status: 404,
			emoji: emoji,
			title: ':alien: 页面飞到火星去了！',
			token: request.session.token && request.session.token != undefined && request.checkUser != undefined ? {
				userName: request.session.userName,
				userId: request.session.userId
			} : null,
			result: ':alien: 页面飞走了！'
		});
	}
});


module.exports = router;