function getUrlParam(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.href);
	return results == null ? "" : decodeURIComponent(results[1]);
}

function replaceParam(paramName, replaceWith) {
	var oUrl = this.location.href.toString();
	var re = eval('/(' + paramName + '=)([^&]*)/gi');
	var nUrl = oUrl.replace(re, paramName + '=' + replaceWith);
	this.location = nUrl;　　
	window.location.href = nUrl
}

function checkMail(v) {
	//^([a-z0-9A-Z]+[-|_|\\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+(-[a-z0-9A-Z]+)?\\.)+[a-zA-Z]{2,}$
	var reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[A-Za-z0-9]+((.|-)[A-Za-z0-9]+).([A-Za-z]{2,4})+$/;
	return reg.test(v);
}