'use strict';
var async = require('async');
var systemError = require('../errors/system');
var memberError = require('../errors/member');
var appointmentError = require('../errors/appointment');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var User = appDb.model('User'),
    DoctorSchedule = appDb.model('DoctorSchedule'),
    ScheduleSetting = appDb.model('ScheduleSetting');

exports.saveScheduleSettings = function(settingInfos, callback){
  async.eachSeries(settingInfos, function(settingInfo, eachCallback){


  }, function(err){
    return callback(err);
  });
};
