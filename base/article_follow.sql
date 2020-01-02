/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:31:44
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for article_follow
-- ----------------------------
DROP TABLE IF EXISTS `article_follow`;
CREATE TABLE `article_follow` (
  `article_id` int(11) NOT NULL DEFAULT '0' COMMENT '文章id',
  `user_id` int(11) DEFAULT NULL COMMENT '用户id',
  `type` varchar(64) DEFAULT NULL COMMENT '类型',
  `follower` varchar(8192) DEFAULT NULL COMMENT '关注者',
  `creat_time` datetime DEFAULT NULL,
  PRIMARY KEY (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
