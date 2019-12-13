const { secretKey, getKeys } = require('./config');
const { sign, verify } = require('./jwt');

function middleware(router) {
	return router.use((req, res, next) => {
		//处理部分资源路径
		//console.log(req.session.userName)
		let page = [];
		let param = req.query || req.params;
		let pageIndex = parseInt(param.pageIndex) || 1;
		let end = parseInt(param.pageSize) || 5;
		let start = (pageIndex - 1) * end;
		page[0] = start;
		page[1] = end;
		req.pageObject = page;

		//静态资源不处理
		if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
			res.redirect(`/static${req.url}`);
		};
		//console.log(req.url)
		//路由不为/login且token不为空
		if (!req.session.token && !req.url.startsWith('/login')) {
			let redirect = req.url.indexOf('?') > -1 ? `/login?redirect=${encodeURIComponent(req.url)}` : '/login';
			res.redirect(redirect);
			return;
		} else {
			//路由为/login
			var _author = getKeys('_token', req.headers['cookie']);
			if (_author) {
				verify(_author.value, function(err, decode) {
					if (err) {
						res.json({
							code: -101,
							msg: '权限不足'
						});
					} else {
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