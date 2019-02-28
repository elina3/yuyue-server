'use strict';
var fs = require('fs'),
path = require('path');
var mongooseLib = require('../libraries/mongoose');
var systemError = require('../errors/system');

exports.updateFiles = function(req, res, next) {
  var fileId = new Date().Format('yyyyMMddhhmm-') + mongooseLib.generateNewObjectId();
  var fileInfo = req.files[0];
  fs.readFile( fileInfo.path, function (err, data) {
    if(err){
      res.send( JSON.stringify( {success: false, message: '找不到文件'} ) );
    }

    var destFile = path.resolve(__dirname, '../../temp_file/' + fileId);
    fs.writeFile(destFile, data, function (err) {
      if( err ){
        console.log( err );
        return next({err: systemError.upload_error});
      }

      req.data = {
        success: true,
        message: '文件成功上传',
        file_name: req.files[0].originalname,
        file_id: fileId
      };
      res.send( JSON.stringify( req.data ) );
    });
  });
};
exports.getFile = function(req, res, next){
  var imageName = req.query.key || '';
  var destFile = path.resolve(__dirname, '../../temp_file/' + imageName);
  res.sendFile(destFile);
};