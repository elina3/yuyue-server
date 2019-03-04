'use strict';
var async = require('async');
var cryptoLib = require('../libraries/crypto'),
    publicLib = require('../libraries/public'),
  enumLib = require('../enums/business');
var userLogic  = require('../logics/user'),
    appointmentLogic = require('../logics/appointment');
var systemError = require('../errors/system'),
userError = require('../errors/user');

exports.signIn = function(req, res, next){
  var username = req.body.username || req.query.username || '';
  var password = req.body.password || req.query.password || '';
  var terminalType = req.body.terminal_type || req.query.terminal_type || '';
  if(!enumLib.terminal_types.valid(terminalType)){
    return next({err: userError.terminal_type_not_exist});
  }

  if(!username || !password){
    return next({err: systemError.param_null_error});
  }
  userLogic.signIn(username, password, terminalType, function(err, user){
    if(err){
      return next(err);
    }

    var accessToken = cryptoLib.encrypToken({_id: user._id, time: new Date()}, 'secret1');
    delete user._doc.password;
    delete user._doc.salt;
    req.data = {
      user: user,
      access_token: accessToken
    };
    return next();
  });
};

exports.createUser = function(req, res, next){
  var admin = req.admin;
  var userInfo = req.body.user_info || req.query.user_info || {};
  if(!userInfo.username || !userInfo.password || !userInfo.role){
    return next({err: systemError.param_null_error});
  }
  if(!userInfo.mobile_phone){
    return next({err: systemError.param_null_error});
  }

  userInfo.hospitalId = admin.hospital;
  userInfo.departmentId = req.department._id;
  userInfo.jobTitleId = req.job_title._id;
  userLogic.createUser(userInfo, function(err, user){
    if(err){
      return next(err);
    }

    req.data = {
      user: user
    };
    return next();
  });
};

exports.getList = function(req, res, next){
  userLogic.queryUsers({searchKey: req.query.search_key, hospitalId: req.hospital_id}, req.pagination, function(err, result){
    if(err){
      return next(err);
    }

    req.data = {
      total_count: result.totalCount,
      users: result.users
    };
    return next();
  });
};
exports.getUserDetail = function(req, res, next){
  req.data = {user: req.detail_user};
  return next();
};

exports.modifyUser = function(req, res, next){
  var user = req.user;
  var userInfo = req.body.user_info || req.query.user_info || {};
  if(!userInfo.username || !userInfo.role){
    return next({err: systemError.param_null_error});
  }
  if(!userInfo.mobile_phone){
    return next({err: systemError.param_null_error});
  }

  userInfo.hospitalId = user.hospital;
  userInfo.departmentId = req.department._id;
  userInfo.jobTitleId = req.job_title._id;

  userLogic.modifyUser(user._id, userInfo, function(err, user){
    if(err){
      return next(err);
    }

    req.data = {
      user: user
    };
    return next();
  });
};

exports.resetPassword = function(req, res, next){
  var user = req.user;
  var oldPassword = req.body.old_password || '';
  var newPassword = req.body.new_password || '';
  if(!oldPassword){
    return next({err: systemError.password_param_error});
  }
  if(!newPassword){
    return next({err: systemError.password_param_error});
  }

  if(!user.authenticate(oldPassword)) {
    return next({ err: systemError.account_not_match });
  }

  userLogic.resetPassword(user, newPassword, function(err, user){
    if(err){
      return next(err);
    }

    req.data = {
      user: user
    };
    return next();
  });
};

exports.deleteUser = function(req, res, next){
  var user = req.admin;
  var userId = req.body.user_id || req.query.user_id || '';
  if(!userId){
    return next({err: systemError.param_null_error});
  }

  userLogic.deleteUser(userId, function(err, user){
    if(err){
      return next(err);
    }

    req.data = {
      user: user
    };
    return next();
  });
};

//获取医生列表
exports.getDoctors = function(req, res, next){
  userLogic.getDoctors({
    outpatient_type: req.query.outpatient_type || '',
    department_id: req.query.department_id || '',
    nickname: req.query.nickname || '',
    on_shelf: publicLib.isTrue(req.query.on_shelf) || ''//只有在传 true 的时候才仅获取上架医生，否则是所有医生
  }, function(err, doctors) {
    if(err){
      return next(err);
    }

    req.data = {
      doctors: doctors
    };
    return next();
  });

};

//上架医生
exports.onShelfDoctor = function(req, res, next){
  var doctorId = req.body.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        if(user.on_shelf){
          return autoCallback({err: userError.doctor_on_shelf});
        }

        if(!user.price || user.price < 0){
          return autoCallback({err: userError.doctor_no_price});
        }

        return autoCallback(null, user);

      });
    },
    onShelf: ['getDoctor', function(autoCallback, result){
      userLogic.updateDoctorShelfStatus(req.user, result.getDoctor._id, true, function(err){
        if(err){
          return autoCallback(err);
        }
        return autoCallback();
      });
    }]
  }, function(err){
    if(err){
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};

//下架
exports.offShelfDoctor = function(req, res, next){
  var doctorId = req.body.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        if(!user.on_shelf){
          return autoCallback({err: userError.doctor_off_shelf});
        }

        return autoCallback(null, user);

      });
    },
    onShelf: ['getDoctor', function(autoCallback, result){
      userLogic.updateDoctorShelfStatus(req.user, result.getDoctor._id, false, function(err){
        if(err){
          return autoCallback(err);
        }
        return autoCallback();
      });
    }]
  }, function(err){
    if(err){
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};

//设置挂号费
exports.setDoctorPrice  =function(req, res, next){
  var doctorId = req.body.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  var newPrice = parseFloat(req.body.price) || 0;
  if(!newPrice || newPrice < 0){//元
    return next({err: userError.price_error});
  }

  newPrice = newPrice * 100;


  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        if(user.on_shelf){
          return autoCallback({err: userError.doctor_on_shelf});
        }

        return autoCallback(null, user);

      });
    },
    onShelf: ['getDoctor', function(autoCallback, result){
      userLogic.setDoctorPrice(req.user, result.getDoctor, parseInt(newPrice), function(err){
        if(err){
          return autoCallback(err);
        }
        return autoCallback();
      });
    }]
  }, function(err){
    if(err){
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};

//获取医生所有时间段的号源--manager
exports.getDoctorSchedules = function(req, res, next){
  var doctorId = req.query.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  var timestamp = parseInt(req.query.timestamp) || 0;
  var date = new Date(timestamp);
  if(!timestamp || timestamp < 0 || !date){
    return next({err: systemError.invalid_timestamp_param});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        return autoCallback(null, {_id: doctorId, nickname: user.nickname, on_shelf: user.on_shelf});

      });
    },
    schedules: ['getDoctor', function(autoCallback, result){
      console.log('data:', date.Format('yyyy-MM-dd'));
      userLogic.getDoctorSchedules(result.getDoctor._id, date, function(err, schedules){
        if(err){
          return autoCallback(err);
        }
        return autoCallback(null, schedules);
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      schedules: results.schedules,
      doctor: results.getDoctor
    };
    return next();
  });
};

//添加号源
exports.addDoctorSchedule = function(req, res, next){
  var doctorId = req.body.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }

  var startTimeStamp = parseInt(req.body.start_timestamp) || 0;
  var endTimeStamp = parseInt(req.body.end_timestamp) || 0;
  var startTime = new Date(startTimeStamp);
  var endTime = new Date(endTimeStamp);
  if(!startTimeStamp || !endTimeStamp || !startTime || !endTime){
    return next({err: systemError.invalid_timestamp_param});
  }

  if(startTimeStamp - endTimeStamp > 0){
    return next({err: userError.start_end_time_invalid});
  }

  var numberCount = parseInt(req.body.number_count) || 0;
  if(numberCount <= 0){
    return next({err: userError.schedule_number_count_error});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        if(user.on_shelf){//已上架不能设置号源
          return autoCallback({err: userError.doctor_on_shelf});
        }

        return autoCallback(null, user);

      });
    },
    addSchedule: ['getDoctor', function(autoCallback, result){
      userLogic.addDoctorSchedule(req.user, result.getDoctor, {start_time: startTime, end_time: endTime, number_count: numberCount}, function(err, schedule){
        if(err){
          return autoCallback(err);
        }
        return autoCallback(null, schedule);
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      schedule: results.addSchedule
    };
    return next();
  });
};


function addOneDoctorSchedule(user, doctor, scheduleInfo, callback){
  var startTimeStamp = parseInt(scheduleInfo.start_timestamp) || 0;
  var endTimeStamp = parseInt(scheduleInfo.end_timestamp) || 0;
  var startTime = new Date(startTimeStamp);
  var endTime = new Date(endTimeStamp);
  if(!startTimeStamp || !endTimeStamp || !startTime || !endTime){
    return callback({err: systemError.invalid_timestamp_param});
  }

  if(startTimeStamp - endTimeStamp > 0){
    return callback({err: userError.start_end_time_invalid});
  }

  var numberCount = parseInt(scheduleInfo.number_count) || 0;
  if(numberCount <= 0){
    return callback({err: userError.schedule_number_count_error});
  }

  userLogic.addDoctorSchedule(user, doctor,
      {
        start_time: startTime,
        end_time: endTime,
        number_count: numberCount
      }, function(err, schedule){
        return callback(err, schedule);
      });
}

//批量添加号源
exports.batchAddDoctorSchedule = function(req, res, next){
  var scheduleInfos = req.body.schedule_infos || [];
  if(scheduleInfos.length === 0){
    return next({err: userError.at_least_one});
  }

  var successCount = 0;
  var userDic = {};
  async.eachSeries(scheduleInfos, function(scheduleInfo, eachCallback){

    async.auto({
      getDoctor: function(autoCallback){
        if(!scheduleInfo.username){
          return autoCallback({err: userError.username_null});
        }
        if(userDic[scheduleInfo.username]){
          return autoCallback(null, userDic[scheduleInfo.username]);
        }
        userLogic.getDoctorByUsername(scheduleInfo.username, function(err, user){
          if(err){
            return autoCallback(err);
          }

          if(user.role !== 'doctor'){
            return autoCallback({err: userError.not_a_doctor});
          }

          if(user.on_shelf){//已上架不能设置号源
            return autoCallback({err: userError.doctor_on_shelf});
          }

          userDic[scheduleInfo.username]  = user;
          return autoCallback(null, user);

        });
      },
      addSchedule: ['getDoctor', function(autoCallback, result){
        addOneDoctorSchedule(req.user, result.getDoctor, scheduleInfo, function(err, schedule){
          if(err){
            return autoCallback(err);
          }

          successCount++;
          return autoCallback(null, schedule);
        });
      }]
    }, function(err, results){
      return eachCallback(err, results.addSchedule);
    });

  }, function(err){
    req.data = {
      success_count: successCount
    };
    return next(err);
  });
};
exports.modifyDoctorSchedule = function(req, res, next){
  var doctorId = req.body.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }
  var scheduleId = req.body.doctor_schedule_id || '';
  if(!scheduleId){
    return next({err: systemError.param_null_error});
  }

  var startTimeStamp = parseInt(req.body.start_timestamp) || 0;
  var endTimeStamp = parseInt(req.body.end_timestamp) || 0;
  var startTime = new Date(startTimeStamp);
  var endTime = new Date(endTimeStamp);
  if(!startTimeStamp || !endTimeStamp || !startTime || !endTime){
    return next({err: systemError.invalid_timestamp_param});
  }

  if(startTimeStamp - endTimeStamp > 0){
    return next({err: userError.start_end_time_invalid});
  }

  var numberCount = parseInt(req.body.number_count) || 0;
  if(numberCount <= 0){
    return next({err: userError.schedule_number_count_error});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        if(user.on_shelf){//已上架不能设置号源
          return autoCallback({err: userError.doctor_on_shelf});
        }

        return autoCallback(null, user);

      });
    },
    updateSchedule: ['getDoctor', function(autoCallback, result){
      userLogic.updateDoctorSchedule(req.user, result.getDoctor,
          {_id: scheduleId, start_time: startTime, end_time: endTime, number_count: numberCount}, function(err){
        if(err){
          return autoCallback(err);
        }
        return autoCallback();
      });
    }]
  }, function(err, results){
    if(err){
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};
exports.deleteDoctorSchedule = function(req, res, next){
  var doctorId = req.body.doctor_id || '';
  if(!doctorId){
    return next({err: systemError.param_null_error});
  }
  var scheduleId = req.body.schedule_id || '';
  if(!scheduleId){
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function(autoCallback){
      userLogic.getUserById(doctorId, function(err, user){
        if(err){
          return autoCallback(err);
        }

        if(user.role !== 'doctor'){
          return autoCallback({err: userError.not_a_doctor});
        }

        if(user.on_shelf){//已上架不能删除
          return autoCallback({err: userError.doctor_on_shelf});
        }

        return autoCallback(null, user);

      });
    },
    getSchedule: function(autoCallback){
      userLogic.getScheduleDetail(scheduleId, function(err, schedule){
        return autoCallback(err, schedule);
      });
    },
    hasBookedSchedule: ['getSchedule', function(autoCallback){
      appointmentLogic.getScheduleAppointmentCount(scheduleId, function(err, count){
        if(err){
          return autoCallback(err);
        }

        if(count > 0){
          return autoCallback({err: userError.has_booked_not_delete});
        }

        return autoCallback(null, count > 0);
      });
    }],
    removeSchedule: ['getDoctor', 'hasBookedSchedule', function(autoCallback){
      userLogic.deleteDoctorSchedule(scheduleId, function(err){
        return autoCallback(err);
      });
    }]
  }, function(err){
    if(err){
      return next(err);
    }

    req.data = {
      success: true
    };
    return next();
  });
};

