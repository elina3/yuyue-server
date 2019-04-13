'use strict';

var reportController = require('../controllers/report');
var authFilter = require('../filters/auth');

module.exports = function (app) {
  app.route('/report/my_reports').get(authFilter.requireMemberByOpenId, reportController.getMyReports);
  app.route('/report/report_detail').get(reportController.getReportDetail)
  app.route('/report/test').get(reportController.test);
};
