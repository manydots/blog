/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:32:54
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for limited
-- ----------------------------
DROP TABLE IF EXISTS `limited`;
CREATE TABLE `limited` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `api` varchar(1024) DEFAULT NULL,
  `method` varchar(255) DEFAULT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `creat_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4527 DEFAULT CHARSET=utf8;
