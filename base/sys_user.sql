/*
Navicat MySQL Data Transfer
Source Database       : blog
Date: 2020-01-02 15:32:37
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `user_name` varchar(128) NOT NULL COMMENT '用户名',
  `pass_word` varchar(256) NOT NULL COMMENT '密码',
  `token` varchar(256) DEFAULT NULL,
  `mail` varchar(512) DEFAULT NULL COMMENT '邮箱',
  `state` varchar(16) DEFAULT '0' COMMENT '账号状态(0正常,1封号)',
  `creat_time` datetime NOT NULL COMMENT '账号创建时间',
  `last_login_time` datetime DEFAULT NULL COMMENT '上次登录时间',
  `ip` varchar(256) DEFAULT NULL COMMENT '登录ip',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES ('11', 'admin', '4a5b2ec1a7102cc6a7d50b5dafc0851e', 'SUCCESS', '111@qq.com', '0', '2019-12-17 15:16:10', null, null);
INSERT INTO `sys_user` VALUES ('12', '小厨', 'e9510081ac30ffa83f10b68cde1cac07', 'SUCCESS', '111@qq.com', '0', '2019-12-20 17:03:04', null, null);
INSERT INTO `sys_user` VALUES ('24', 'admin1', 'e9510081ac30ffa83f10b68cde1cac07', 'SUCCESS', '111@qq.com', '0', '2019-12-26 15:26:54', null, null);
