'use strict';

var hospitalController = require('../controllers/hospital');
var authFilter = require('../filters/auth');

module.exports = function (app) {
  app.route('/hospital/create').post(authFilter.requireAdmin, hospitalController.createHospital);
  app.route('/hospital/detail').get(authFilter.requireAdmin, hospitalController.getHospitalDetail);
};
