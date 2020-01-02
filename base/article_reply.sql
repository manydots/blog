/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:31:54
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for article_reply
-- ----------------------------
DROP TABLE IF EXISTS `article_reply`;
CREATE TABLE `article_reply` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `article_id` int(11) NOT NULL COMMENT '文章id',
  `from_user_id` int(11) DEFAULT '0' COMMENT '评论用户id',
  `to_user_id` int(11) DEFAULT '0' COMMENT '评论目标用户id（文章作者id）',
  `content` varchar(256) DEFAULT NULL COMMENT '评论内容',
  `creat_time` datetime DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8;
