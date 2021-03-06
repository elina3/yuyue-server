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
  app.route('/user/modify').post(authFilter.requireUserById, hospitalFilter.requireDepartment, hospitalFilter.requireJobTitle, userController.modifyUser);
  app.route('/user/reset_password').post(authFilter.requireUserById, userController.resetPassword);

  app.route('/user/doctor/list').get(userController.getDoctors);
  app.route('/user/doctor/on_shelf').post(authFilter.requireUser, userController.onShelfDoctor);
  app.route('/user/doctor/off_shelf').post(authFilter.requireUser, userController.offShelfDoctor);
  app.route('/user/doctor/set_price').post(authFilter.requireUser, userController.setDoctorPrice);

  app.route('/user/doctor/schedule_list').get(userController.getDoctorSchedules);
  app.route('/user/doctor/add_schedule').post(authFilter.requireUser, userController.addDoctorSchedule);
  app.route('/user/doctor/batch_add_schedule').post(authFilter.requireUser, userController.batchAddDoctorSchedule);
  app.route('/user/doctor/modify_schedule').post(authFilter.requireUser, userController.modifyDoctorSchedule);
  app.route('/user/doctor/delete_schedule').post(authFilter.requireUser, userController.deleteDoctorSchedule);
  //停诊
  app.route('/user/doctor/stop_appointment').post(authFilter.requireUser, userController.stopDoctorSchedule);
  app.route('/user/doctor/repeat_start_appointment').post(authFilter.requireUser, userController.repeatStartDoctorSchedule);


  // app.route('/user/sign_up').post(authFilter.requireUser, userController.signUp);
  // app.route('/user/modify').post(authFilter.requireAdmin, userController.modifyUser);
  // app.route('/user/delete').post(authFilter.requireAdmin, userController.deleteUser);
};
