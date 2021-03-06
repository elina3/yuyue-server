/**
 * Created by elinaguo on 15/12/14.
 */
'use strict';

var testController = require('../controllers/test');

module.exports = function (app) {
  app.route('/test/pay').post(testController.testPay);
  app.route('/test/xml').get(testController.testXML);
  app.route('/test/notify').post(testController.notifyPayResult);
  app.route('/test/add_data').post(testController.addData);
  app.route('/test/testSendSMS').post(testController.testSendSMS);
  app.route('/test/testSendBatchSMS').post(testController.testSendBatchSMS);
};
