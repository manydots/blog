/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-06 14:26:30
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for notice
-- ----------------------------
DROP TABLE IF EXISTS `notice`;
CREATE TABLE `notice` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key_id` int(11) DEFAULT '0' COMMENT '文章或其他关键id',
  `from_user_id` int(11) NOT NULL COMMENT '消息来源',
  `to_user_id` int(11) NOT NULL COMMENT '目标用户',
  `context` varchar(8196) DEFAULT NULL COMMENT '消息内容',
  `type` varchar(256) NOT NULL DEFAULT 'reply' COMMENT '消息类型',
  `state` varchar(64) NOT NULL DEFAULT '1' COMMENT '0已读，1未读',
  `creat_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
