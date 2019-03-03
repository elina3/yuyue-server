/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var appointmentController = require('../controllers/appointment');
var authFilter = require('../filters/auth'),
  paginationFilter = require('../filters/pagination');

module.exports = function (app) {
  //manager获取所有预约
  app.route('/appointment/list').get(paginationFilter.requirePagination, appointmentController.getAllAppointments);
  app.route('/appointment/pick_up_list').get(appointmentController.getPickupList);

  //app端获取医生可预约时间段
  app.route('/app/doctor/schedules').get(appointmentController.getAllUnBookSchedules);
  //获取预览预约信息--还没有预定
  app.route('/app/doctor/preview_appointment_info').get(appointmentController.previewAppointmentInfo);
  //创建一条预约记录
  app.route('/app/doctor/create_appointment').post(authFilter.requireMemberByOpenId, appointmentController.createNewAppointmentInfo);
  app.route('/app/doctor/appointment_list').get(authFilter.requireMemberByOpenId, appointmentController.getMyAppointments);
  //app,manger看详情的接口
  app.route('/app/doctor/appointment_detail').get(appointmentController.getAppointmentDetail);
};
