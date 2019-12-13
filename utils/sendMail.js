var nodemailer = require("nodemailer");
var { mailBase } = require('./config');
var { formatDate } = require('./index');

var transporter = nodemailer.createTransport({
	host: 'smtp.qq.com',
	service: 'qq',
	secure: true,
	auth: {
		user: mailBase.user,
		pass: mailBase.pass
	}
});

async function sendMails(to, sendHtml, callback) {
	if (to == '' || sendHtml == '') {
		return;
	}

	var mailOptions = {
		// 发送邮件的地址
		from: mailBase.from,
		// 接收邮件的地址
		to: to,
		// 邮件主题
		subject: mailBase.subject,
		// 以HTML的格式显示，这样可以显示图片、链接、字体颜色等信息
		html: sendHtml
	};

	// 发送邮件，并有回调函数
	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(`[收件人]:${to};[内容]:${sendHtml};[时间]:${formatDate()},发送失败`);
			if (callback) {
				callback(null)
			}
			return;
			//return console.log(error);
		} else {
			//console.log('Message sent: ' + info.response);
			console.log(`[收件人]:${to};[内容]:${sendHtml};[时间]:${formatDate()},成功发送`);
			if (callback) {
				callback(info)
			}

		}
	});

}

module.exports = {
	sendMails: sendMails,
	formatDate: formatDate
};