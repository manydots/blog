/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:31:33
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '文章id',
  `author` varchar(256) NOT NULL COMMENT '文章作者，用户nick',
  `user_id` int(11) NOT NULL COMMENT '用户id',
  `state` varchar(11) DEFAULT '0' COMMENT '文章状态(0正常,1临时回收站)',
  `reply` varchar(255) DEFAULT '0' COMMENT '是否开启评论功能(0开启,1关闭)',
  `title` varchar(256) NOT NULL COMMENT '文章标题',
  `context` varchar(8192) DEFAULT NULL COMMENT '文章内容',
  `tags` varchar(256) DEFAULT NULL COMMENT '文章标签',
  `creat_time` datetime DEFAULT NULL COMMENT '文章创建时间',
  `modify_time` datetime DEFAULT NULL COMMENT '文章标记时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8;
