'use strict';
var systemError = require('../errors/system');
var userError = require('../errors/user');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var User = appDb.model('User');

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

exports.modifyUser = function(userId, userInfo, callback) {
  User.findOne({ _id: userId }).exec(function(err, user) {
    if (err) {
      return callback({ err: systemError.internal_system_error });
    }

    if (!user && user.deleted_status) {
      return callback({ err: userError.user_not_exist });
    }

    if (userInfo.password) {//修改密码
      user.password = userInfo.password
          ? user.hashPassword(userInfo.password)
          : '';
    }
    user.nickname = userInfo.nickname;
    user.role = userInfo.role;
    user.terminalType = userInfo.terminalType || 'management';

    user.hospital = userInfo.hospitalId;
    user.department = userInfo.departmentId;
    user.job_title = userInfo.jobTitleId;

    user.sex = !userInfo.sex ? 'unknown' : userInfo.sex;
    user.mobile_phone = userInfo.mobile_phone;
    user.head_photo = userInfo.head_photo;
    user.description = userInfo.description;
    user.deleted_status = false;
    user.save(function(err, modifiedUser) {
      if (err || !modifiedUser) {
        return callback({ err: systemError.database_save_error });
      }

      return callback(null, modifiedUser);
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
    role: 'doctor'
  };
  if(filter.outpatient_type){//门诊类型
    query.outpatient_type = filter.outpatient_type;
  }
  if(filter.department_id){
    query.department = filter.department_id;
  }
  if(filter.nickname){
    query.nickname = {$regex: filter.nickname, $options: 'i'};
  }
  if (filter.on_shelf) {//需要仅获取上架的医生,App端获取医生信息
    query.on_shelf = true;
  }
  User.find(query).populate('department job_title').exec(function(err, doctors) {
    if(err){
      console.log(err);
      return callback({err: systemError.database_query_error});
    }

    return callback(null, doctors);
  });
};

exports.updateDoctorShelfStatus = function(user, doctorId, onShelf, callback){
  User.update({_id: doctorId}, {$set: {on_shelf: onShelf, recent_modify_user: user._id}}, function(err){
    if(err){
      console.log(err);
      return callback({err: systemError.database_update_error});
    }

    var action = onShelf ? 'on_shelf' : 'off_shelf';
    doctorActionHistoryLogic.addDoctorActionHistory(user, doctorId, action, null, function(){});

    return callback();
  });
};
exports.setDoctorPrice = function(user, doctor, newPrice, callback){
  var oldPrice = doctor.price;
  User.update({_id: doctor._id}, {$set: {price: newPrice, recent_modify_user: user._id}}, function(err){
    if(err){
      console.log(err);
      return callback({err: systemError.database_update_error});
    }

    doctorActionHistoryLogic.addDoctorActionHistory(user, doctor._id, 'set_price', {oldPrice: oldPrice, newPrice: newPrice}, function(){});
    return callback();
  });
};
