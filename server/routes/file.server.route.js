'use strict';

var fileController = require('../controllers/file');

module.exports = function (app) {
  app.route('/file_upload').post(fileController.updateFiles);
  app.route('/file/image').get(fileController.getFile);
};
