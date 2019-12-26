var jwt = require('jsonwebtoken');
let content = {
	time: 17989877,
};
let secretKey = "TEST_KEY"; //加密的key（密钥） 

//加密
let token = jwt.sign(content, secretKey, {
	expiresIn: 60 * 1 // 1分钟过期
});


let ts = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TG9naW5UaW1lIjoxNTc2MTE4MDQ4Njc5LCJpc0xvZ2luIjp0cnVlLCJpYXQiOjE1NzYxMTgwNDgsImV4cCI6MTU3NjExODEwOH0.8P-AfF3FN23xh6r252wXgdT5jLKs_X15OmzeRZRUTB0';
//解密
jwt.verify(ts, secretKey, function(err, decode) {
	if (err) {
		//时间失效的时候伪造的token 
		console.log('异常token')
	} else {
		console.log(decode)
	}
})