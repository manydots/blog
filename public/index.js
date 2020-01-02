function pjaxs(options) {
  var self = this;
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: options.url ? options.url : '',
      type: options.method ? options.method : 'get',
      data: options.data ? options.data : '',
      headers: options.headers ? options.headers : '',
      beforeSend: function(diss) {
        //禁用提交按钮
      },
      success: function(res) {
        if (resolve) {
          if (!options.headers || !options.headers['x-pjax']) {
            resolve(stringToObject(res));
          } else {
            resolve(res);
          }

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

function clickGo(href, target) {
  var a = document.createElement('a');
  var nodeName = 'GO_SEARCH_AUTO';
  a.style.display = 'none';
  a.setAttribute('href', href);
  a.setAttribute('target', target || '_blank');
  a.setAttribute('id', nodeName);
  // 防止反复添加
  if (!document.getElementById(nodeName) || document.getElementById(nodeName).length == 0) {
    document.body.appendChild(a);
  }
  a.click();
  if (document.getElementById(nodeName)) {
    document.body.removeChild(document.getElementById(nodeName));
  }
}

function formatDate(date, fmt) {
  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }
  if (fmt === undefined) {
    fmt = 'yyyy-MM-dd hh:mm:ss';
  }
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S': date.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  return fmt;

}
/*
 ** 时间戳显示为多少分钟前，多少天前的处理
 ** eg.
 ** console.log(dateDiff(1411111111111));  // 2014年09月19日
 ** console.log(dateDiff(1481111111111));  // 9月前
 ** console.log(dateDiff(1499911111111));  // 2月前
 ** console.log(dateDiff(1503211111111));  // 3周前
 ** console.log(dateDiff(1505283100802));  // 1分钟前
 */
function dateDiff(timestamp) {
  // 补全为13位
  var arrTimestamp = (timestamp + '').split('');
  for (var start = 0; start < 13; start++) {
    if (!arrTimestamp[start]) {
      arrTimestamp[start] = '0';
    }
  }
  timestamp = arrTimestamp.join('') * 1;

  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var halfamonth = day * 15;
  var month = day * 30;
  var now = new Date().getTime();
  var diffValue = now - timestamp;

  // 如果本地时间反而小于变量时间
  if (diffValue < 0) {
    return '不久前';
  }

  // 计算差异时间的量级
  var monthC = diffValue / month;
  var weekC = diffValue / (7 * day);
  var dayC = diffValue / day;
  var hourC = diffValue / hour;
  var minC = diffValue / minute;

  // 数值补0方法
  var zero = function(value) {
    if (value < 10) {
      return '0' + value;
    }
    return value;
  };

  // 使用
  if (monthC > 12) {
    // 超过1年，直接显示年月日
    return (function() {
      var date = new Date(timestamp);
      return date.getFullYear() + '年' + zero(date.getMonth() + 1) + '月' + zero(date.getDate()) + '日';
    })();
  } else if (monthC >= 1) {
    return parseInt(monthC) + "月前";
  } else if (weekC >= 1) {
    return parseInt(weekC) + "周前";
  } else if (dayC >= 1) {
    return parseInt(dayC) + "天前";
  } else if (hourC >= 1) {
    return parseInt(hourC) + "小时前";
  } else if (minC >= 1) {
    return parseInt(minC) + "分钟前";
  }
  return '刚刚';
};