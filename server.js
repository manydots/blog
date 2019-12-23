var express = require('express');
var session = require('express-session');
var bodyparser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var router = require('./routes/index');
var { secretKey, cookieMaxAge } = require('./utils/config');
var port = process.env.port || 3034;
var { initServer } = require('./utils/http');
var middleware = require('./routes/middleware');

app.use(cookieParser());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
	extended: true
}));

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
app.use('/static', express.static(path.join(__dirname, 'public')));

//设置跨域访问
app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin);
	res.header('Access-Control-Allow-Credentials', 'true');
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By", '3.2.1');
	next();
});
//console.log(middleware)
app.use(middleware(express.Router()));

//使用ejs
app.set('views', path.join(__dirname, './views'));
app.set("view engine", "ejs");

//使用路由
app.use(router);

server.listen(port, () => {
	console.log('Node Server listening at port %d.', port);
});