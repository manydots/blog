const {
	secretKey,
	getKeys
} = require('../utils/config');
const {
	sign,
	verify
} = require('../utils/jwt');

function middleware(router) {
	return router.use((req, res, next) => {
		//处理部分资源路径
		//console.log(req.session.userName)
		//静态资源不处理
		if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
			res.redirect(`/static${req.url}`);
		};
		//console.log(req.url)
		//路由不为/login且token不为空
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
				pageIndex:parseInt(req.query.pageIndex) || 1,
				pageSize: parseInt(req.query.pageSize) || 10
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