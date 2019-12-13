function checkMail(v) {
	var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).([A-Za-z]{2,4})+$/;
	return reg.test(v);
}


module.exports = {
	checkMail: checkMail
};