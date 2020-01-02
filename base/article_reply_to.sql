/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:32:07
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for article_reply_to
-- ----------------------------
DROP TABLE IF EXISTS `article_reply_to`;
CREATE TABLE `article_reply_to` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reply_id` int(11) NOT NULL DEFAULT '0' COMMENT '对应评论表主键',
  `article_id` int(11) NOT NULL DEFAULT '0' COMMENT '文章id',
  `from_user_id` int(11) DEFAULT '0' COMMENT '新回复用户id',
  `to_user_id` int(11) DEFAULT '0' COMMENT '对应评论表评论者（from_user_id）',
  `content` varchar(256) DEFAULT NULL,
  `creat_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
