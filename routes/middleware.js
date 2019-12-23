const { getKeys, getClientIp, formatDate } = require('../utils/index');
const { sign, verify} = require('../utils/jwt');
const { RabbitMQ } = require('../utils/rabbitMQ');
const { sysUser } = require('../utils/sql');
const { query } = require('../utils/db');

let mq = new RabbitMQ();


function middleware(router) {
	return router.use((req, res, next) => {
		//处理部分资源路径
		//console.log(req.session.userName)
		//静态资源不处理
		if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
			res.redirect(`/static${req.url}`);
		};
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
		//路由不为/login且token不为空

		query(sysUser.intoLimitLog, function(err, rows, fields) {
			if (err) {
				console.log(err)
			} else {
				console.log('intoLimitLog success')
			};
		}, params);
		mq.sendQueueMsg('testQueue', params, (msg) => {
			//success
			//console.log(msg)
			if (msg == 'success') {
				
			}
		})

		if (!req.session.token && (req.url.startsWith('/edit') || req.url.startsWith('/send'))) {
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
			
			if (req.session.token && req.headers['x-pjax'] && req.method == 'POST') {
				console.log(req.url, req.method)
				// res.redirect('/');
				// return;
			}
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