'use strict';

var hospitalController = require('../controllers/hospital');
var authFilter = require('../filters/auth'),
hospitalFilter = require('../filters/hospital'),
    paginationFilter = require('../filters/pagination');

module.exports = function (app) {
  app.route('/hospital/create').post(authFilter.requireAdmin, hospitalController.createHospital);
  app.route('/hospital/detail').get(authFilter.requireAdmin, hospitalFilter.requireHospital, hospitalController.getHospitalDetail);

  app.route('/hospital/department/create').post(authFilter.requireAdmin, hospitalController.createDepartment);
  app.route('/hospital/department/edit').post(authFilter.requireAdmin, hospitalFilter.requireDepartment, hospitalController.modifyDepartment);
  app.route('/hospital/department/delete').post(authFilter.requireAdmin, hospitalFilter.requireDepartment, hospitalController.deleteDepartment);
  app.route('/hospital/department/list').get(authFilter.requireUser, hospitalController.getDepartmentList);
  app.route('/hospital/department/detail').get(hospitalFilter.requireDepartment, hospitalController.getDepartmentDetail);

  // app端获取公开的科室列表
  app.route('/hospital/department/open_list').get(hospitalController.getOpenDepartmentList);
  // app段获取可浏览的科室列表
  app.route('/hospital/department/open_view_list').get(hospitalController.getOpenViewDepartmentList);
  // app段获取可预约的科室列表
  app.route('/hospital/department/open_order_list').get(hospitalController.getOpenOrderDepartmentList);

  app.route('/hospital/job_title/create').post(authFilter.requireAdmin, hospitalController.createJobTitle);
  app.route('/hospital/job_title/edit').post(authFilter.requireAdmin, hospitalFilter.requireJobTitle, hospitalController.editJobTitle);
  app.route('/hospital/job_title/list').get(authFilter.requireUser, hospitalController.getJobTitleList);
  app.route('/hospital/job_title/detail').get(authFilter.requireUser, hospitalFilter.requireJobTitle, hospitalController.getJobTitleDetail);
};
