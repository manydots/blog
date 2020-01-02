/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:33:01
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for keywords
-- ----------------------------
DROP TABLE IF EXISTS `keywords`;
CREATE TABLE `keywords` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `context` varchar(4096) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of keywords
-- ----------------------------
INSERT INTO `keywords` VALUES ('1', '草泥马');
INSERT INTO `keywords` VALUES ('2', '王八蛋');
INSERT INTO `keywords` VALUES ('3', '王八');
INSERT INTO `keywords` VALUES ('4', '草');
INSERT INTO `keywords` VALUES ('5', '贱货');
INSERT INTO `keywords` VALUES ('6', '共产党');
INSERT INTO `keywords` VALUES ('7', '死全家');
INSERT INTO `keywords` VALUES ('8', '玩意');
INSERT INTO `keywords` VALUES ('9', '傻逼');
INSERT INTO `keywords` VALUES ('10', '脑残');
INSERT INTO `keywords` VALUES ('11', '智障');
INSERT INTO `keywords` VALUES ('12', '菜比');
INSERT INTO `keywords` VALUES ('13', 'sb');
INSERT INTO `keywords` VALUES ('14', 'SB');
INSERT INTO `keywords` VALUES ('15', 'Sb');
INSERT INTO `keywords` VALUES ('16', 'sB');
INSERT INTO `keywords` VALUES ('17', '废物');
INSERT INTO `keywords` VALUES ('18', '屁话');
INSERT INTO `keywords` VALUES ('19', '狗屁');
INSERT INTO `keywords` VALUES ('20', '臭逼');
INSERT INTO `keywords` VALUES ('21', '垃圾');
