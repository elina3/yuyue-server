'use strict';

var memberController = require('../controllers/member');
var authFilter = require('../filters/auth'),
    hospitalFilter = require('../filters/hospital'),
    paginationFilter = require('../filters/pagination');

module.exports = function (app) {
  //后台管理人员查看就诊人列表
  app.route('/member/list').get(authFilter.requireUser, paginationFilter.requirePagination, memberController.getAllMembers);
  app.route('/member/detail').get(memberController.getMemberDetail);



  app.route('/member/check_by_openid').get(memberController.checkMemberByOpenId);

  //微信open_id注册会员信息（由wechat授权重定向返回）
  app.route('/member/bind_card').post(memberController.registerAndBindCard);
  app.route('/member/unbind_card').post(memberController.unbindCard);


  // app.route('/member/appointment/create').post();

  // app.route('/user/sign_up').post(authFilter.requireUser, userController.signUp);
  // app.route('/user/modify').post(authFilter.requireAdmin, userController.modifyUser);
  // app.route('/user/delete').post(authFilter.requireAdmin, userController.deleteUser);
};
