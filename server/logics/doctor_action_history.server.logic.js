'use strict';
var systemError = require('../errors/system');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var DoctorActionHistory = appDb.model('DoctorActionHistory');

exports.addDoctorActionHistory = function(user, doctorId, action, extend, callback){
  var doctorActionHistory = new DoctorActionHistory({
    doctor: doctorId,
    change_user: user._id,
    action: action,
    extend_data: extend,
    operator_time: new Date()
  });
  doctorActionHistory.save(function(err, saved) {
    if(err){
      console.log(err);
      return callback({err: systemError.database_save_error});
    }

    return callback();
  });
};
