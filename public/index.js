function pjax(options) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: options.url ? options.url : '',
      type: options.method ? options.method : 'get',
      data: options.data ? options.data : '',
      beforeSend: function(diss) {
        //禁用提交按钮

      },
      success: function(res) {
        if (resolve) {
          resolve(stringToObject(res))
        }
      },
      error: function(error) {
        reject(stringToObject(error))
      }
    })
  })
}

function stringToObject(data) {
  var results = null,
    index = 0;
  if (data && data != '' && data != '""') {
    results = data;
  } else {
    return;
  }
  while (typeof results === 'string') {
    index++;
    if (results.indexOf('{') > -1 && results.lastIndexOf('}') > -1) {
      results = JSON.parse(results);
    } else {
      break;
    }
  };
  return results;
}

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
	var reg = /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;
	return reg.test(v);
}