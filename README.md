## 简易版博客（仅供学习使用）

[博客预览](https://blog.jeeas.cn/)


### 项目启动
```
 
   [Windows] npm run server:http or 
   [Linux] npm run server:linux
   
```

### 项目部署
```

	使用wss建立websoket时需要注意:
  nginx需要配置:(或者查看https://github.com/manydots/node)

	server {
        listen 443 ssl;
        server_name  blog.jeeas.cn;
        ssl_certificate cert/blog.jeeas.cn.pem;#证书位置
        ssl_certificate_key cert/blog.jeeas.cn.key;#证书位置
        ssl_session_timeout 5m;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;  #使用此加密套件。
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;   #使用该协议进行配置。
        ssl_prefer_server_ciphers on;
        location / {
              proxy_pass http://localhost:8090/; #反向代理集群
              proxy_buffering off;    #此参数非常重要，必须禁用代理缓存.
              proxy_set_header   Host             $host;
              proxy_set_header   X-Real-IP        $remote_addr;
              proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection "Upgrade";

        }
  	}

```

### 已实现功能概况
```javascript
 	
 	一、基础功能
 	  1、用户注册(MD5加密、禁用账号)、邮箱简单验证激活、用户登录(状态session保持15分钟)；
 	  2、文章基础发布、文章评论开关、文章编辑修改、删除文章(更改文章状态,找回)、彻底删除文章(删除数据库记录)、最新文章推荐；
 	  3、文章点赞、取消点赞、文章评论(支持简单版回复)；
 	  4、站内文章搜索(文章关键词title,context搜索)、关键词搜索排行；
 	  5、邮件基本发送；

 	二、其他
 	  1、记录接口访问；
 	  2、部分路由session登录状态拦截；
 	  3、输入内容关键词、敏感词屏蔽；

 	备注：
 	  1、sql查询未加索引
 	  2、部分字段未校验长度
 	  3、文章内容仅支持文字(暂未支持图片和html标签)
 	  4、点赞表、评论回复表还需要重新设计优化
 	  5、数据库表结构在/base文件夹下


```

### 其他说明
```javascript
 	
 	rabbitMQ:简单使用收发消息队列
  node-schedule:定时任务
  express-rate-limit:访问限制20s内60次
  apicache:缓存1.2s

```