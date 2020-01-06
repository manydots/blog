const { getKeys, getClientIp, formatDate } = require('../utils/index');
const { sign, verify} = require('../utils/jwt');
//const { sysUser,query } = require('../utils/sql');

function middleware(router) {
	return router.use((req, res, next) => {
		//处理部分资源路径
		//console.log(req.session.userName)
		//静态资源不处理
		//console.log(res.locals)
		if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
			res.redirect(`/static${req.url}`);
		};
		//console.log(req.keywords)
		//路由不为/login且token不为空
		if (!req.session.token && (req.url.startsWith('/news') || req.url.startsWith('/ad') || req.url.startsWith('/al') || req.url.startsWith('/edit') || req.url.startsWith('/send'))) {
			let redirect = req.url.indexOf('?') > -1 ? `/login?redirect=${encodeURIComponent(req.url)}` : '/login';
			res.redirect(redirect);
			return;
		} else {
			//路由为/login
			var _author = getKeys('_token', req.headers['cookie']);
			//console.log(req.body)
			//console.log(req.query)
			// req.indexPage = {
			// 	pageIndex:parseInt(req.body.pageIndex) || 1,
			// 	pageSize: parseInt(req.body.pageSize) || 10
			// };
			req.indexPage = {
				pageIndex: parseInt(req.query.pageIndex) || 1,
				pageSize: parseInt(req.query.pageSize) || 10
			};

			//req.session.token && !req.headers['x-pjax'] && req.method == 'POST'
			//console.log(!req.headers['x-pjax'],req.url)
			//console.log(res.rabbitMQ)
			if (req.url !='/' && !req.url.includes('favicon.ico')) {
				//console.log(req.url, req.method)
				let ip = getClientIp(req, 'nginx');
				let params = [{
					values: req.url,
					column: 'api'
				}, {
					values: req.method,
					column: 'method',
				}, {
					values: ip,
					column: 'ip'
				}, {
					values: formatDate(),
					column: 'creat_time'
				}];
				//console.log(params)
				if (res.rabbitMQ) {
					res.rabbitMQ.sendQueueMsg('testQueue', params, (msg) => {
						//success
						if (msg == 'success') {
							console.log(`[sendQueueMsg]:success.`);
							if (res.ioServer) {
								//向web前端推送消息
								res.ioServer.sockets.emit('Queues', {
									time: formatDate(),
									newsType: "server-prop-sendQueue",
									sql:intoLimitLog,
									params:params,
									dataType: 'sendQueue'
								});
							}
							//console.log(rows.insertId)
							// query({
							// 	sql:sysUser.intoLimitLog,
							// 	params:params,
							// 	res:res
							// });
						}
					});
				}
			};
			//console.log(req.indexPage)
			if (_author) {
				verify(_author.value, function(err, decode) {
					if (err) {
						res.json({
							code: -101,
							msg: '权限不足'
						});
					} else {
						req.checkUser = decode;
						next();
					}
				})
			} else {
				next();
			}
		}
	});

}

module.exports = middleware;