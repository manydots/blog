var express = require('express');
var session = require('express-session');
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var cache = require('apicache').middleware;
var rateLimit = require("express-rate-limit");
var io = require('socket.io')(server);
var router = require('./routes/index');
var { secretKey, cookieMaxAge } = require('./utils/config');
var { getClientIp } = require('./utils/index');
var port = process.env.port || 3035;
var { initServer } = require('./utils/http');
var middleware = require('./routes/middleware');
var keywords = require('./routes/keywords');
var { RabbitMQ } = require('./utils/rabbitMQ');
var { scheduleCron } = require('./routes/schedule');
var results = [];
let mq = new RabbitMQ();

app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
	extended: true
}));

//定时器开启[true]
scheduleCron(mq, null, true);

//api访问限制20s内60次
const limiter = rateLimit({
	windowMs: 20 * 1000, // 20 s
	max: 60, //limit each IP to {max} requests per windowMs
	handler: function(req, res) {
		let ip = getClientIp(req,'nginx');
		console.log(`访问频繁ip:[${ip}]`);
		res.status(429).end(`Too many requests, please try again later. ip:${ip}`);
	}
});
app.use(limiter);

//cache 缓存2分钟  2 minutes  0.05 minutes=3s 0.02 minutes = 1.2s
//缓存时间过大会影响清除session,部分API
app.use(cache('0.02 minutes', ((req, res) => res.statusCode === 200)));

//加载敏感关键词
keywords(function(rows){
	results = rows;
});

app.use(session({
	secret: secretKey,
	name: '_checkToken',
	//退出后保持的时间
	cookie: {
		maxAge: 1 * 1000 * 60 * cookieMaxAge
	},
	resave: false,
	saveUninitialized: false,
}));

initServer(io);

//static
//https://cdn.jsdelivr.net/gh/manydots/blog@0.0.1/public/index.js
app.use('/static', express.static(path.join(__dirname, 'public')));

//设置跨域访问
app.all('*', (req, res, next) => {
	req.keywords = results;
	res.ioServer = io;
	res.rabbitMQ = mq;
	res.locals.tools = null;
	res.header("Access-Control-Allow-Origin", req.headers.origin);
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", '3.2.1');

	/*options请求快速响用*/
	if (req.method == "OPTIONS") {
		res.send(200);
	} else {
		next();
	};

});

//console.log(middleware)
app.use(middleware(express.Router()));
//使用ejs
app.set('views', path.join(__dirname, './views'));
app.set("view engine", "ejs");
// 开启模板缓存
//app.set('view cache', true);

//使用路由
app.use(router);

server.listen(port, () => {
	console.log('Node Server listening at port %d.', port);
});