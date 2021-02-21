'use strict';
var async = require('async');
var cryptoLib = require('../libraries/crypto'),
  publicLib = require('../libraries/public'),
  enumLib = require('../enums/business');
var userLogic = require('../logics/user'),
  appointmentLogic = require('../logics/appointment'),
  aliSMSAPIService = require('../services/ali_sms_api'),
  wechatService = require('../services/wechat');
var systemError = require('../errors/system'),
  userError = require('../errors/user');

exports.signIn = function (req, res, next) {
  var username = req.body.username || req.query.username || '';
  var password = req.body.password || req.query.password || '';
  var terminalType = req.body.terminal_type || req.query.terminal_type || '';
  if (!enumLib.terminal_types.valid(terminalType)) {
    return next({err: userError.terminal_type_not_exist});
  }

  if (!username || !password) {
    return next({err: systemError.param_null_error});
  }
  userLogic.signIn(username, password, terminalType, function (err, user) {
    if (err) {
      return next(err);
    }

    var accessToken = cryptoLib.encrypToken({_id: user._id, time: new Date()},
      'secret1');
    delete user._doc.password;
    delete user._doc.salt;
    req.data = {
      user: user,
      access_token: accessToken,
    };
    return next();
  });
};

exports.createUser = function (req, res, next) {
  var admin = req.admin;
  var userInfo = req.body.user_info || req.query.user_info || {};
  if (!userInfo.username || !userInfo.password || !userInfo.role) {
    return next({err: systemError.param_null_error});
  }
  if (!userInfo.mobile_phone) {
    return next({err: systemError.param_null_error});
  }

  userInfo.hospitalId = admin.hospital;
  userInfo.departmentId = req.department._id;
  userInfo.jobTitleId = req.job_title._id;
  userLogic.createUser(userInfo, function (err, user) {
    if (err) {
      return next(err);
    }

    req.data = {
      user: user,
    };
    return next();
  });
};

exports.getList = function (req, res, next) {
  userLogic.queryUsers(
    {searchKey: req.query.search_key, hospitalId: req.hospital_id},
    req.pagination, function (err, result) {
      if (err) {
        return next(err);
      }

      req.data = {
        total_count: result.totalCount,
        users: result.users,
      };
      return next();
    });
};
exports.getUserDetail = function (req, res, next) {
  req.data = {user: req.detail_user};
  return next();
};

exports.modifyUser = function (req, res, next) {
  var user = req.user;
  var userInfo = req.body.user_info || req.query.user_info || {};
  if (!userInfo.username || !userInfo.role) {
    return next({err: systemError.param_null_error});
  }
  if (!userInfo.mobile_phone) {
    return next({err: systemError.param_null_error});
  }

  userInfo.hospitalId = user.hospital;
  userInfo.departmentId = req.department._id;
  userInfo.jobTitleId = req.job_title._id;

  userLogic.modifyUser(user._id, userInfo, function (err, user) {
    if (err) {
      return next(err);
    }

    req.data = {
      user: user,
    };
    return next();
  });
};

exports.resetPassword = function (req, res, next) {
  var user = req.user;
  var oldPassword = req.body.old_password || '';
  var newPassword = req.body.new_password || '';
  if (!oldPassword) {
    return next({err: systemError.password_param_error});
  }
  if (!newPassword) {
    return next({err: systemError.password_param_error});
  }

  if (!user.authenticate(oldPassword)) {
    return next({err: systemError.account_not_match});
  }

  userLogic.resetPassword(user, newPassword, function (err, user) {
    if (err) {
      return next(err);
    }

    req.data = {
      user: user,
    };
    return next();
  });
};

exports.deleteUser = function (req, res, next) {
  var user = req.admin;
  var userId = req.body.user_id || req.query.user_id || '';
  if (!userId) {
    return next({err: systemError.param_null_error});
  }

  userLogic.deleteUser(userId, function (err, user) {
    if (err) {
      return next(err);
    }

    req.data = {
      user: user,
    };
    return next();
  });
};

//获取医生列表
exports.getDoctors = function (req, res, next) {
  userLogic.getDoctors({
    outpatient_type: req.query.outpatient_type || '',
    department_id: req.query.department_id || '',
    nickname: req.query.nickname || '',
    on_shelf: publicLib.isTrue(req.query.on_shelf) || '',//只有在传 true 的时候才仅获取上架医生，否则是所有医生
  }, function (err, doctors) {
    if (err) {
      return next(err);
    }

    req.data = {
      doctors: doctors,
    };
    return next();
  });

};

//上架医生
exports.onShelfDoctor = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        if (user.on_shelf) {
          return autoCallback({err: userError.doctor_on_shelf});
        }

        //支持设置为0的价格
        if (user.price < 0) {
          return autoCallback({err: userError.doctor_no_price});
        }

        return autoCallback(null, user);

      });
    },
    onShelf: [
      'getDoctor', function (autoCallback, result) {
        userLogic.updateDoctorShelfStatus(req.user, result.getDoctor._id, true,
          function (err) {
            if (err) {
              return autoCallback(err);
            }
            return autoCallback();
          });
      }],
  }, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};

//下架
exports.offShelfDoctor = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        if (!user.on_shelf) {
          return autoCallback({err: userError.doctor_off_shelf});
        }

        return autoCallback(null, user);

      });
    },
    onShelf: [
      'getDoctor', function (autoCallback, result) {
        userLogic.updateDoctorShelfStatus(req.user, result.getDoctor._id, false,
          function (err) {
            if (err) {
              return autoCallback(err);
            }
            return autoCallback();
          });
      }],
  }, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};

//设置挂号费
exports.setDoctorPrice = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }

  var newPrice = parseFloat(req.body.price) || 0;
  //专家价格支持设置为0
  if (newPrice < 0) {//元
    return next({err: userError.price_error});
  }
  var newSpecialPrice = parseFloat(req.body.special_price) || 0;
  //特需价格支持设置为0
  if (newSpecialPrice < 0) {
    newSpecialPrice = 0;
  }

  newPrice = newPrice * 100;
  newSpecialPrice = newSpecialPrice * 100;

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        if (user.on_shelf) {
          return autoCallback({err: userError.doctor_on_shelf});
        }

        return autoCallback(null, user);

      });
    },
    onShelf: [
      'getDoctor', function (autoCallback, result) {
        userLogic.setDoctorPrice(req.user, result.getDoctor, parseInt(newPrice),
          parseInt(newSpecialPrice), function (err) {
            if (err) {
              return autoCallback(err);
            }
            return autoCallback();
          });
      }],
  }, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};

//获取医生所有时间段的号源--manager
exports.getDoctorSchedules = function (req, res, next) {
  var doctorId = req.query.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }

  var timestamp = parseInt(req.query.timestamp) || 0;
  var date = new Date(timestamp);
  if (!timestamp || timestamp < 0 || !date) {
    return next({err: systemError.invalid_timestamp_param});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserDetailById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        return autoCallback(null, {
          _id: doctorId,
          nickname: user.nickname,
          on_shelf: user.on_shelf,
          department_name: user.department.name,
          price: user.price,
          special_price: user.special_price,
          outpatient_type: user.outpatient_type,
        });

      });
    },
    schedules: [
      'getDoctor', function (autoCallback, result) {
        console.log('data:', date.Format('yyyy-MM-dd'));
        userLogic.getDoctorSchedules(result.getDoctor._id, date,
          function (err, schedules) {
            if (err) {
              return autoCallback(err);
            }
            return autoCallback(null, schedules);
          });
      }],
    loadScheduleNumbers: [
      'schedules', function (autoCallback, result) {
        appointmentLogic.loadScheduleAppointmentCount(result.schedules,
          function (err) {
            return autoCallback(err);
          });
      }],
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    req.data = {
      schedules: results.schedules,
      doctor: results.getDoctor,
    };
    return next();
  });
};

//添加号源
exports.addDoctorSchedule = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }

  var startTimeStamp = parseInt(req.body.start_timestamp) || 0;
  var endTimeStamp = parseInt(req.body.end_timestamp) || 0;
  var startTime = new Date(startTimeStamp);
  var endTime = new Date(endTimeStamp);
  if (!startTimeStamp || !endTimeStamp || !startTime || !endTime) {
    return next({err: systemError.invalid_timestamp_param});
  }

  if (startTimeStamp - endTimeStamp > 0) {
    return next({err: userError.start_end_time_invalid});
  }

  if (startTimeStamp - new Date().getTime() < 0) {
    return next({err: systemError.start_time_past});
  }

  var numberCount = parseInt(req.body.number_count) || 0;
  if (numberCount <= 0) {
    return next({err: userError.schedule_number_count_error});
  }

  var priceType = req.body.price_type || 'price';//默认普通价格，specialPrice：特需价格，price：专家/普通价格
  if (['price', 'special_price'].indexOf(priceType) === -1) {
    return next({err: userError.no_price_type});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        if (user.on_shelf) {//已上架不能设置号源
          return autoCallback({err: userError.doctor_on_shelf});
        }

        //支持设置为0
        if (priceType.price_type === 'price' &&
          (user.price < 0)) {
          return autoCallback({err: userError.doctor_no_price});
        }

        //支持设置为0
        if (priceType.price_type === 'special_price' &&
          (user.special_price < 0)) {
          return autoCallback({err: userError.doctor_no_special_price});
        }

        return autoCallback(null, user);

      });
    },
    addSchedule: [
      'getDoctor', function (autoCallback, result) {
        userLogic.addDoctorSchedule(req.user, result.getDoctor, {
          start_time: startTime,
          end_time: endTime,
          number_count: numberCount,
          price_type: priceType,
        }, function (err, schedule) {
          if (err) {
            return autoCallback(err);
          }
          return autoCallback(null, schedule);
        });
      }],
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    req.data = {
      schedule: results.addSchedule,
    };
    return next();
  });
};

function addOneDoctorSchedule(user, doctor, scheduleInfo, callback) {
  var startTimeStamp = parseInt(scheduleInfo.start_timestamp) || 0;
  var endTimeStamp = parseInt(scheduleInfo.end_timestamp) || 0;
  var startTime = new Date(startTimeStamp);
  var endTime = new Date(endTimeStamp);
  if (!startTimeStamp || !endTimeStamp || !startTime || !endTime) {
    return callback({err: systemError.invalid_timestamp_param});
  }

  if (startTimeStamp - endTimeStamp > 0) {
    return callback({err: userError.start_end_time_invalid});
  }

  if (startTimeStamp - new Date().getTime() < 0) {
    return next({err: systemError.start_time_past});
  }

  var numberCount = parseInt(scheduleInfo.number_count) || 0;
  if (numberCount <= 0) {
    return callback({err: userError.schedule_number_count_error});
  }

  var priceType = scheduleInfo.price_type || 'price';//默认普通价格，specialPrice：特需价格，price：专家/普通价格
  if (['price', 'special_price'].indexOf(priceType) === -1) {
    return callback({err: userError.no_price_type});
  }

  userLogic.addDoctorSchedule(user, doctor,
    {
      start_time: startTime,
      end_time: endTime,
      number_count: numberCount,
      price_type: priceType,
    }, function (err, schedule) {
      return callback(err, schedule);
    });
}

//批量添加号源
exports.batchAddDoctorSchedule = function (req, res, next) {
  var scheduleInfos = req.body.schedule_infos || [];
  if (scheduleInfos.length === 0) {
    return next({err: userError.at_least_one});
  }

  var successCount = 0;
  var userDic = {};
  async.eachSeries(scheduleInfos, function (scheduleInfo, eachCallback) {

    async.auto({
      getDoctor: function (autoCallback) {
        if (!scheduleInfo.username) {
          return autoCallback({err: userError.username_null});
        }
        if (userDic[scheduleInfo.username]) {
          return autoCallback(null, userDic[scheduleInfo.username]);
        }
        userLogic.getDoctorByUsername(scheduleInfo.username,
          function (err, user) {
            if (err) {
              return autoCallback(err);
            }

            if (user.role !== 'doctor') {
              return autoCallback({err: userError.not_a_doctor});
            }

            if (!user.on_shelf) {//已下架
              userDic[scheduleInfo.username] = user;
              return autoCallback(null, user);
            }

            //下架医生
            userLogic.updateDoctorShelfStatus(req.user, user._id, false,
              function (err) {
                if (err) {
                  return autoCallback(err);
                }

                return autoCallback(null, user);
              });
          });
      },
      addSchedule: [
        'getDoctor', function (autoCallback, result) {
          addOneDoctorSchedule(req.user, result.getDoctor, scheduleInfo,
            function (err, schedule) {
              if (err) {
                return autoCallback(err);
              }

              successCount++;
              //上架医生
              userLogic.updateDoctorShelfStatus(req.user,
                result.getDoctor._id, true, function (err) {
                  if (err) {
                    return autoCallback(err);
                  }

                  return autoCallback(null, schedule);
                });
            });
        }],
    }, function (err, results) {
      return eachCallback(err, results.addSchedule);
    });

  }, function (err) {
    req.data = {
      success_count: successCount,
    };
    return next(err);
  });
};

//修改预约时间后通知时间不一致的已预约用户
function noticeMembersWithModifiedSchedule(scheduleId, newStartTime, newEndTime, callback) {
  appointmentLogic.getScheduleAppointmentWithMemberInfo(scheduleId,
    function (err, appointments) {
      if (err) {
        return callback(err);
      }

      if (appointments.length === 0) {
        return callback();
      }

      var firstAppointment = appointments[0];
      var timeString = firstAppointment.start_time.Format('yyyy/MM/dd hh:mm') + firstAppointment.end_time.Format('~ hh:mm');
      var newTimeRageString = newStartTime.Format('yyyy/MM/dd hh:mm') + newEndTime.Format('~ hh:mm');
      if (timeString === newTimeRageString) {//时间未变不推送
        return callback();
      }

      var phones = [];
      var appointmentInfos = [];
      appointments.forEach(function (item) {
        phones.push(item.member.mobile_phone);
        var startTimeString = item.start_time.Format('yyyy/MM/dd hh:mm');
        var timeRangeString = startTimeString + item.end_time.Format('~ hh:mm');
        appointmentInfos.push({
          name: item.nickname,
          doctorName: item.doctor.nickname,
          department: item.department.name,
          time: startTimeString,
          timeRangeString: timeRangeString
        });
        item.timeRangeString = timeRangeString; //用于微信推送
        item.newTimeRangeString = newTimeRageString; //用于微信推送
        wechatService.sendRepeatStartedAppointmentMessage(item.member.open_id, 'http://datonghao.com/client/#/me/appointment', item, function () {

        });
      });

      console.log('send sms begin-----');
      aliSMSAPIService.sendAppointmentChangedBySMS(
        phones,
        appointmentInfos, function (err) {
          if (err) {
            console.log('send sms failed!!!!');
          } else {
            console.log('send sms success!!!');
          }
        });

      return callback();
    });
}

exports.modifyDoctorSchedule = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }
  var scheduleId = req.body.doctor_schedule_id || '';
  if (!scheduleId) {
    return next({err: systemError.param_null_error});
  }

  var startTimeStamp = parseInt(req.body.start_timestamp) || 0;
  var endTimeStamp = parseInt(req.body.end_timestamp) || 0;
  var startTime = new Date(startTimeStamp);
  var endTime = new Date(endTimeStamp);
  if (!startTimeStamp || !endTimeStamp || !startTime || !endTime) {
    return next({err: systemError.invalid_timestamp_param});
  }

  if (startTimeStamp - endTimeStamp > 0) {
    return next({err: userError.start_end_time_invalid});
  }

  if (startTimeStamp - new Date().getTime() < 0) {
    return next({err: systemError.start_time_past});
  }

  var numberCount = parseInt(req.body.number_count) || 0;
  if (numberCount <= 0) {
    return next({err: userError.schedule_number_count_error});
  }

  var priceType = req.body.price_type || 'price';//默认普通价格，specialPrice：特需价格，price：专家/普通价格
  if (['price', 'special_price'].indexOf(priceType) === -1) {
    return next({err: userError.no_price_type});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        if (user.on_shelf) {//已上架不能设置号源
          return autoCallback({err: userError.doctor_on_shelf});
        }

        return autoCallback(null, user);

      });
    },
    updateSchedule: [
      'getDoctor', function (autoCallback, result) {
        userLogic.updateDoctorSchedule(req.user, result.getDoctor,
          {
            _id: scheduleId,
            start_time: startTime,
            end_time: endTime,
            number_count: numberCount,
            price_type: priceType,
          }, function (err) {
            if (err) {
              return autoCallback(err);
            }

            noticeMembersWithModifiedSchedule(scheduleId, startTime, endTime, function (err) {
              if (err) {
                console.log(err);
              }
            });
            return autoCallback();
          });
      }],
  }, function (err, results) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};
exports.deleteDoctorSchedule = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }
  var scheduleId = req.body.schedule_id || '';
  if (!scheduleId) {
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        if (user.on_shelf) {//已上架不能删除
          return autoCallback({err: userError.doctor_on_shelf});
        }

        return autoCallback(null, user);

      });
    },
    getSchedule: function (autoCallback) {
      userLogic.getScheduleDetail(scheduleId, function (err, schedule) {
        return autoCallback(err, schedule);
      });
    },
    hasBookedSchedule: [
      'getSchedule', function (autoCallback) {
        appointmentLogic.getScheduleAppointmentCount(scheduleId,
          function (err, count) {
            if (err) {
              return autoCallback(err);
            }

            if (count > 0) {
              return autoCallback({err: userError.has_booked_not_delete});
            }

            return autoCallback(null, count > 0);
          });
      }],
    removeSchedule: [
      'getDoctor',
      'getSchedule',
      'hasBookedSchedule',
      function (autoCallback, results) {
        userLogic.deleteDoctorSchedule(req.user, doctorId, results.getSchedule,
          function (err) {
            return autoCallback(err);
          });
      }],
  }, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};

function noticeMembersWithStoppedSchedule(scheduleId, callback) {
  appointmentLogic.getScheduleAppointmentWithMemberInfo(scheduleId,
    function (err, appointments) {
      if (err) {
        return callback(err);
      }

      if (appointments.length === 0) {
        return callback();
      }
      // appointments = [
      //   {
      //     doctor: {
      //       nickname: '张立人'
      //     },
      //     member: {
      //       mobile_phone: '18321740710'
      //     },
      //     department: {
      //       name: '普通门诊'
      //     },
      //     nickname: '郭姗姗',
      //     start_time: new Date('2020/12/10 10:00'),
      //     end_time: new Date('2020/12/10 12:00')
      //   },
      //   {
      //     doctor: {
      //       nickname: '华佗'
      //     },
      //     member: {
      //       mobile_phone: '15586463013'
      //     },
      //     department: {
      //       name: '专家门诊'
      //     },
      //     nickname: '郭鑫鑫',
      //     start_time: new Date('2020/12/10 10:00'),
      //     end_time: new Date('2020/12/10 12:00')
      //   }
      // ];

      console.log('appointments count > 1');

      var phones = [];
      var appointmentInfos = [];
      appointments.forEach(function (item) {
        phones.push(item.member.mobile_phone);
        appointmentInfos.push({
          name: item.nickname,
          doctorName: item.doctor.nickname,
          department: item.department.name,
          time: item.start_time.Format('yyyy/MM/dd hh:mm'),
        });
        wechatService.sendStoppedAppointmentMessage(item.member.open_id, 'http://datonghao.com/client/#/me/appointment', item, function () {

        });
      });

      console.log('send sms begin-----');
      aliSMSAPIService.sendAppointmentStoppedBySMS(
        phones,
        appointmentInfos, function (err) {
          if (err) {
            console.log('send sms failed!!!!');
          } else {
            console.log('send sms success!!!');
          }
        });

      return callback();
    });
}

function noticeMembersWithRepeatStartSchedule(scheduleId, callback) {
  appointmentLogic.getScheduleAppointmentWithMemberInfo(scheduleId,
    function (err, appointments) {
      if (err) {
        return callback(err);
      }

      if (appointments.length === 0) {
        return callback();
      }

      var phones = [];
      var appointmentInfos = [];

      appointments.forEach(function (item) {
        phones.push(item.member.mobile_phone);
        var startTimeString = item.start_time.Format('yyyy/MM/dd hh:mm');
        var timeRangeString = startTimeString + item.end_time.Format('~ hh:mm');
        appointmentInfos.push({
          name: item.nickname,
          doctorName: item.doctor.nickname,
          department: item.department.name,
          time: startTimeString,
          timeRangeString: timeRangeString
        });
        wechatService.sendRepeatStartedAppointmentMessage(item.member.open_id, 'http://datonghao.com/client/#/me/appointment', item, function () {

        });
      });

      console.log('send sms begin-----');
      aliSMSAPIService.sendAppointmentRepeatStartBySMS(
        phones,
        appointmentInfos, function (err) {
          if (err) {
            console.log('send sms failed!!!!');
          } else {
            console.log('send sms success!!!');
          }
        });

      return callback();
    });
}

//停诊
exports.stopDoctorSchedule = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }
  var scheduleId = req.body.schedule_id || '';
  if (!scheduleId) {
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        return autoCallback(null, user);

      });
    },
    getSchedule: function (autoCallback) {
      userLogic.getScheduleDetail(scheduleId, function (err, schedule) {

        if (schedule.is_stopped) {//已停诊
          return autoCallback({err: userError.doctor_schedule_stopped});
        }

        if (schedule.end_time.getTime() - new Date() <= 0) {//结束时间已过，不需要停诊
          return autoCallback({err: userError.doctor_schedule_over})
        }

        return autoCallback(err, schedule);
      });
    },
    stopDoctorSchedule: [
      'getDoctor', 'getSchedule', function (autoCallback, results) {
        userLogic.stopDoctorSchedule(req.user, doctorId, results.getSchedule,
          function (err) {
            if (err) {
              return autoCallback(err);
            }

            //todo 通知该预约的所有病人
            noticeMembersWithStoppedSchedule(scheduleId, function (err) {
              if (err) {
                console.log(err);
              }
            });

            return autoCallback(err);
          });
      }],
  }, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};
//重新开诊
exports.repeatStartDoctorSchedule = function (req, res, next) {
  var doctorId = req.body.doctor_id || '';
  if (!doctorId) {
    return next({err: systemError.param_null_error});
  }
  var scheduleId = req.body.schedule_id || '';
  if (!scheduleId) {
    return next({err: systemError.param_null_error});
  }

  async.auto({
    getDoctor: function (autoCallback) {
      userLogic.getUserById(doctorId, function (err, user) {
        if (err) {
          return autoCallback(err);
        }

        if (user.role !== 'doctor') {
          return autoCallback({err: userError.not_a_doctor});
        }

        return autoCallback(null, user);

      });
    },
    getSchedule: function (autoCallback) {
      userLogic.getScheduleDetail(scheduleId, function (err, schedule) {

        if (!schedule.is_stopped) {//未停诊，不需重新开诊
          return autoCallback({err: userError.doctor_schedule_not_stopped});
        }

        if (schedule.end_time.getTime() - new Date() <= 0) {//结束时间已过，不需要重新开诊
          return autoCallback({err: userError.doctor_schedule_over})
        }

        return autoCallback(err, schedule);
      });
    },
    repeatStartDoctorSchedule: [
      'getDoctor', 'getSchedule', function (autoCallback, results) {
        userLogic.repeatStartDoctorSchedule(req.user, doctorId, results.getSchedule,
          function (err) {
            if (err) {
              return autoCallback(err);
            }

            //todo 通知该预约的所有病人重新开诊
            noticeMembersWithRepeatStartSchedule(scheduleId, function (err) {
              if (err) {
                console.log(err);
              }
            });

            return autoCallback(err);
          });
      }],
  }, function (err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};

