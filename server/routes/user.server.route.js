/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var userController = require('../controllers/user');
var authFilter = require('../filters/auth');

module.exports = function (app) {
  app.route('/user_groups').get(authFilter.requireUser, userController.getGroups);
  app.route('/users/list').get(authFilter.requireAdmin, userController.getNormalUsers);
  app.route('/user/sign_in').post(userController.signIn);
  app.route('/user/sign_up').post(authFilter.requireUser, userController.signUp);
  app.route('/user/modify').post(authFilter.requireAdmin, userController.modifyUser);
  app.route('/user/delete').post(authFilter.requireAdmin, userController.deleteUser);
};
