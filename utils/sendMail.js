var nodemailer = require("nodemailer");
var { mailBase } = require('./config');

var transporter = nodemailer.createTransport({
	host: 'smtp.qq.com',
	service: 'qq',
	secure: true,
	auth: {
		user: mailBase.user,
		pass: mailBase.pass
	}
});

var sendHtml = `<div>
      <div>点击激活账号</div>
    </div>`;

var mailOptions = {
	// 发送邮件的地址
	from: mailBase.from,
	// 接收邮件的地址
	to: '1191441460@qq.com',
	// 邮件主题
	subject: mailBase.subject,
	// 以HTML的格式显示，这样可以显示图片、链接、字体颜色等信息
	html: sendHtml
};
// 发送邮件，并有回调函数
transporter.sendMail(mailOptions, function(error, info) {
	if (error) {
		console.log('发送失败');
		return;
		//return console.log(error);
	} else {
		console.log('Message sent: ' + info.response);
	}
});