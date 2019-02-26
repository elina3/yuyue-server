/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var userController = require('../controllers/user');
var authFilter = require('../filters/auth'),
  hospitalFilter = require('../filters/hospital'),
  paginationFilter = require('../filters/pagination');

module.exports = function (app) {

  app.route('/user/list').get(authFilter.requireUser, paginationFilter.requirePagination, userController.getList);
  app.route('/user/detail').get(authFilter.requireUserDetailById, userController.getUserDetail);
  app.route('/user/sign_in').post(userController.signIn);
  app.route('/user/create').post(authFilter.requireAdmin, hospitalFilter.requireDepartment, hospitalFilter.requireJobTitle, userController.createUser);

  app.route('/user/doctor/list').get(userController.getDoctors);
  app.route('/user/doctor/on_shelf').post(authFilter.requireUser, userController.onShelfDoctor);
  app.route('/user/doctor/off_shelf').post(authFilter.requireUser, userController.offShelfDoctor);
  app.route('/user/doctor/set_price').post(authFilter.requireUser, userController.setDoctorPrice);
  app.route('/user/doctor/add_schedule').post(authFilter.requireUser, userController.addSchedule);


  // app.route('/user/sign_up').post(authFilter.requireUser, userController.signUp);
  // app.route('/user/modify').post(authFilter.requireAdmin, userController.modifyUser);
  // app.route('/user/delete').post(authFilter.requireAdmin, userController.deleteUser);
};
