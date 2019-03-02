'use strict';
var async = require('async');
var systemError = require('../errors/system');
var userError = require('../errors/user');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var User = appDb.model('User'),
    DoctorSchedule = appDb.model('DoctorSchedule');

var doctorActionHistoryLogic = require('./doctor_action_history');

exports.createUser = function(userInfo, callback) {
  User.findOne({ hospital: userInfo.hospitalId, username: userInfo.username }).
      exec(function(err, user) {
        if (err) {
          return callback({ err: systemError.internal_system_error });
        }

        if (user && !user.deleted_status) {
          return callback({ err: userError.user_exist });
        }

        if (!user) {
          user = new User({
            username: userInfo.username,
          });
        }
        user.password = userInfo.password
            ? user.hashPassword(userInfo.password)
            : '';
        user.nickname = userInfo.nickname;
        user.role = userInfo.role;
        user.terminal_types = userInfo.terminal_types ||
            ['manager', 'doctor', 'pick_up'];

        user.hospital = userInfo.hospitalId;
        user.department = userInfo.departmentId;
        user.job_title = userInfo.jobTitleId;
        user.outpatient_type = userInfo.outpatient_type;

        user.sex = !userInfo.sex ? 'unknown' : userInfo.sex;
        user.mobile_phone = userInfo.mobile_phone;
        user.head_photo = userInfo.head_photo;
        user.deleted_status = false;
        user.good_at = userInfo.good_at;
        user.brief = userInfo.brief;
        user.IDCard = userInfo.IDCard;
        if (userInfo.permission) {
          for (var prop in userInfo.permission) {
            userInfo.permission[prop].forEach(item => {
              delete item.$$hashKey;
            });
          }
          user.permission = userInfo.permission;
        }
        user.save(function(err, newUser) {
          if (err || !newUser) {
            console.error(err);
            return callback({ err: systemError.database_save_error });
          }

          return callback(null, newUser);
        });
      });

};

exports.deleteUser = function(userId, callback) {
  User.findOne({ _id: userId }, function(err, user) {
    if (err) {
      return callback({ err: systemError.database_query_error });
    }

    if (!user) {
      return callback({ err: userError.user_not_exist });
    }

    if (user.deleted_status) {
      return callback({ err: userError.user_deleted });
    }

    user.deleted_status = true;
    user.save(function(err, newUser) {
      if (err || !newUser) {
        return callback({ err: systemError.database_save_error });
      }

      return callback(null, newUser);
    });
  });
};

function userParamValid(userId, userInfo, callback){
  async.auto({
    validUsername: function(autoCallback){
      User.findOne({username: userInfo.username, deleted_status: false, _id: {$ne: userId}})
      .select('username')
          .exec(function(err, user){
            if(err){
              return autoCallback({err: systemError.database_query_error});
            }

            if(user){
              return autoCallback({err: userError.username_exist});
            }

            return autoCallback();
      });
    },
    validIDCard: function(autoCallback){
      User.findOne({IDCard: userInfo.IDCard, deleted_status: false, _id: {$ne: userId}})
      .select('username')
      .exec(function(err, user){
        if(err){
          return autoCallback({err: systemError.database_query_error});
        }

        if(user){
          return autoCallback({err: userError.IDCard_exist});
        }

        return autoCallback();
      });
    }
  }, function(err){
    if(err){
      return callback(err);
    }
    return callback();
  });
}

exports.modifyUser = function(userId, userInfo, callback) {
  User.findOne({ _id: userId }).exec(function(err, user) {
    if (err) {
      return callback({ err: systemError.internal_system_error });
    }

    if (!user && user.deleted_status) {
      return callback({ err: userError.user_not_exist });
    }

    userParamValid(userId, userInfo, function(err){
      if(err){
        return callback(err);
      }

      user.username = userInfo.username;
      user.nickname = userInfo.nickname;
      user.role = userInfo.role;
      user.terminal_types = userInfo.terminal_types ||
          ['manager', 'doctor', 'pick_up'];

      user.hospital = userInfo.hospitalId;
      user.department = userInfo.departmentId;
      user.job_title = userInfo.jobTitleId;
      user.outpatient_type = userInfo.outpatient_type;

      user.sex = !userInfo.sex ? 'unknown' : userInfo.sex;
      user.mobile_phone = userInfo.mobile_phone;
      user.head_photo = userInfo.head_photo;
      user.deleted_status = false;
      user.good_at = userInfo.good_at;
      user.brief = userInfo.brief;
      user.IDCard = userInfo.IDCard;
      if (userInfo.permission) {
        for (var prop in userInfo.permission) {
          userInfo.permission[prop].forEach(item => {
            delete item.$$hashKey;
          });
        }
        user.permission = userInfo.permission;
      }
      user.save(function(err, modifiedUser) {
        if (err || !modifiedUser) {
          return callback({ err: systemError.database_save_error });
        }

        return callback(null, modifiedUser);
      });
    });
  });
};

exports.queryUsers = function(filter, pagination, callback) {
  var query = { deleted_status: false };
  if (filter.searchKey) {
    query.$or = [
      { mobile_phone: { $regex: filter.searchKey, $options: '$i' } },
      { IDCard: { $regex: filter.searchKey, $options: '$i' } },
      { nickname: { $regex: filter.searchKey, $options: '$i' } },
      { username: { $regex: filter.searchKey, $options: '$i' } },
    ];
  }
  User.count(query, function(err, totalCount) {
    if (err) {
      return callback({ err: systemError.database_query_error });
    }

    if (totalCount === 0) {
      return callback(null, { totalCount: 0, users: [] });
    }

    if (pagination.limit === -1) {
      pagination.limit = 10;
    }
    if (pagination.skip_count === -1) {
      pagination.skip_count = pagination.limit * (pagination.current_page - 1);
    }

    User.find(query).
        sort({ update_time: -1 }).
        skip(pagination.skip_count).
        limit(pagination.limit).
        populate('department job_title').
        exec(function(err, users) {
          if (err) {
            return callback({ err: systemError.database_query_error });
          }

          return callback(null, { totalCount: totalCount, users: users });
        });

  });
};

exports.getUserById = function(userId, callback) {
  User.findOne({ _id: userId }).exec(function(err, user) {
    if (err) {
      return callback({ err: systemError.internal_system_error });
    }

    if (!user || user.deleted_status) {
      return callback(userError.user_not_exist);
    }

    return callback(null, user);
  });
};
exports.getUserDetailById = function(userId, callback) {
  User.findOne({ _id: userId }).
      populate('department job_title').
      exec(function(err, user) {
        if (err) {
          return callback({ err: systemError.internal_system_error });
        }

        if (!user || user.deleted_status) {
          return callback(userError.user_not_exist);
        }

        return callback(null, user);
      });
};

exports.signIn = function(username, password, terminalType, callback) {
  User.findOne({ username: username }).
      exec(function(err, user) {
        if (err) {
          return callback({ err: systemError.internal_system_error });
        }

        if (!user || user.deleted_status) {
          return callback({ err: userError.user_not_exist });
        }

        if (!user.authenticate(password)) {
          return callback({ err: systemError.account_not_match });
        }

        if (user.terminal_types.indexOf(terminalType) === -1) {
          return callback({ err: userError.no_terminal_permission });
        }

        return callback(null, user);
      });
};

exports.getDoctors = function(filter, callback) {
  var query = {
    role: 'doctor',
  };
  if (filter.outpatient_type) {//门诊类型
    query.outpatient_type = filter.outpatient_type;
  }
  if (filter.department_id) {
    query.department = filter.department_id;
  }
  if (filter.nickname) {
    query.nickname = { $regex: filter.nickname, $options: 'i' };
  }
  if (filter.on_shelf) {//需要仅获取上架的医生,App端获取医生信息
    query.on_shelf = true;
  }
  User.find(query).
      populate('department job_title').
      exec(function(err, doctors) {
        if (err) {
          console.log(err);
          return callback({ err: systemError.database_query_error });
        }

        return callback(null, doctors);
      });
};

exports.updateDoctorShelfStatus = function(user, doctorId, onShelf, callback) {
  User.update({ _id: doctorId },
      { $set: { on_shelf: onShelf, recent_modify_user: user._id } },
      function(err) {
        if (err) {
          console.log(err);
          return callback({ err: systemError.database_update_error });
        }

        var action = onShelf ? 'on_shelf' : 'off_shelf';
        doctorActionHistoryLogic.addDoctorActionHistory(user, doctorId, action,
            null, function() {});

        return callback();
      });
};
exports.setDoctorPrice = function(user, doctor, newPrice, callback) {
  var oldPrice = doctor.price;
  User.update({ _id: doctor._id },
      { $set: { price: newPrice, recent_modify_user: user._id } },
      function(err) {
        if (err) {
          console.log(err);
          return callback({ err: systemError.database_update_error });
        }

        doctorActionHistoryLogic.addDoctorActionHistory(user, doctor._id,
            'set_price', { oldPrice: oldPrice, newPrice: newPrice },
            function() {});
        return callback();
      });
};

exports.getDoctorSchedules = function(doctorId, date, callback) {
  console.log('date:', date.getTime());
  var query = {
    doctor: doctorId,
    date_string: date.Format('yyyy-MM-dd'),
  };
  DoctorSchedule.find(query).
      select(
          'date date_string start_time end_time start_time_string end_time_string number_count').
      exec(function(err, schedules) {
        if (err) {
          console.log(err);
          return callback({ err: systemError.database_query_error });
        }

        return callback(null, schedules);
      });
};

function isInvalidScheduleRange(existsSchedules, newStartTime, newEndTime) {
  var hasRange = false;
  for (var i = 0; i < existsSchedules.length; i++) {
    var item = existsSchedules[i];
    if (newStartTime.getTime() >= item.start_time.getTime() &&
        newStartTime.getTime() <= item.end_time.getTime()) {
      hasRange = true;
      break;
    }
    if (newEndTime.getTime() >= item.start_time.getTime() &&
        newEndTime.getTime() <= item.end_time.getTime()) {
      hasRange = true;
      break;
    }
    if(newStartTime.getTime() <= item.start_time.getTime() && newEndTime.getTime() >= item.end_time.getTime()){
      hasRange = true;
      break;
    }

  }

  return !hasRange;
}

exports.addDoctorSchedule = function(user, doctor, scheduleInfo, callback) {
  var dateString = scheduleInfo.start_time.Format('yyyy-MM-dd');
  async.auto({
    otherSchedules: function(autoCallback) {
      DoctorSchedule.find({ doctor: doctor._id, date_string: dateString }).
          exec(function(err, doctorSchedules) {
            if (err) {
              return autoCallback({ err: systemError.database_query_error });
            }
            console.log(doctorSchedules);

            var isValid = isInvalidScheduleRange(doctorSchedules,
                scheduleInfo.start_time, scheduleInfo.end_time);
            if (!isValid) {
              return autoCallback({ err: userError.time_range_repeat });
            }

            return autoCallback();
          });
    },
    addNew: [
      'otherSchedules', function(autoCallback) {
        var doctorSchedule = new DoctorSchedule({
          operator_user: user._id,
          doctor: doctor._id,
          date_string: dateString,
          start_time: scheduleInfo.start_time,
          start_time_string: scheduleInfo.start_time.Format('hh:mm'),
          end_time: scheduleInfo.end_time,
          end_time_string: scheduleInfo.end_time.Format('hh:mm'),
          number_count: scheduleInfo.number_count
        });
        doctorSchedule.save(function(err, saved) {
          if (err) {
            return autoCallback({ err: systemError.database_save_error });
          }

          doctorActionHistoryLogic.addDoctorActionHistory(user, doctor._id,
              'add_schedule',
              {
                schedule_id: saved._id,
                start_time: scheduleInfo.start_time,
                end_time: scheduleInfo.end_time,
                number_count: scheduleInfo.number_count,
              }, function() {});
          return autoCallback(null, saved);
        });
      }],
  }, function(err, results) {
    if (err) {
      return callback(err);
    }

    return callback(null, results.addNew);
  });
};

exports.updateDoctorSchedule = function(user, doctor, scheduleInfo, callback) {
  DoctorSchedule.findOne({ _id: scheduleInfo._id }).
      exec(function(err, doctorSchedule) {
        if (err) {
          return callback({ err: systemError.database_query_error });
        }

        if (!doctorSchedule) {
          return callback({ err: userError.doctor_schedule_not_exist });
        }

        async.auto({
          otherSchedules: function(autoCallback, result) {
            var query = {
              doctor: doctor._id,
              date_string: doctorSchedule.date_string,
              _id: {$ne: scheduleInfo._id}
            };
            DoctorSchedule.find(query).exec(function(err, otherSchedules) {
              if (err) {
                console.log(err);
                return autoCallback({ err: systemError.database_query_error });
              }

              var isInvalid = isInvalidScheduleRange(otherSchedules,
                  scheduleInfo.start_time, scheduleInfo.end_time);
              if (!isInvalid) {
                return autoCallback({ err: userError.time_range_repeat });
              }

              return autoCallback();
            });
          },
          updateSchedule: [
            'otherSchedules', function(autoCallback) {

              doctorSchedule = {
                operator_user: user._id,
                start_time: scheduleInfo.start_time,
                start_time_string: scheduleInfo.start_time.Format('hh:mm'),
                end_time: scheduleInfo.end_time,
                end_time_string: scheduleInfo.end_time.Format('hh:mm'),
                number_count: scheduleInfo.number_count,
              };
              DoctorSchedule.update({ _id: scheduleInfo._id },
                  { $set: doctorSchedule }, function(err) {
                    if (err) {
                      return autoCallback(
                          { err: systemError.database_update_error });
                    }
                    doctorActionHistoryLogic.addDoctorActionHistory(user,
                        doctor._id,
                        'update_schedule',
                        {
                          schedule_id: scheduleInfo._id,
                          start_time: scheduleInfo.start_time,
                          end_time: scheduleInfo.end_time,
                          number_count: scheduleInfo.number_count,
                        }, function() {});
                    return autoCallback();
                  });
            }],
        }, function(err) {
          if (err) {
            return callback(err);
          }
          return callback();
        });
      });
};

exports.getScheduleDetail = function(scheduleId, callback){
  DoctorSchedule.findOne({ _id: scheduleId }).
      exec(function(err, doctorSchedule) {
        if (err) {
          return callback({ err: systemError.database_query_error });
        }

        if (!doctorSchedule) {
          return callback({ err: userError.doctor_schedule_not_exist });
        }

        return callback(null, doctorSchedule);
      });
};
