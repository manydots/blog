/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:32:19
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for article_search
-- ----------------------------
DROP TABLE IF EXISTS `article_search`;
CREATE TABLE `article_search` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `keywords` varchar(256) NOT NULL,
  `type` varchar(64) DEFAULT NULL,
  `total` int(11) NOT NULL DEFAULT '1',
  `creat_time` datetime DEFAULT NULL,
  `modify_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;
