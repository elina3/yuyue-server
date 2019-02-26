/**
 * Created by elinaguo on 16/2/25.
 */
'use strict';
var async = require('async');
var cryptoLib = require('../libraries/crypto'),
    publicLib = require('../libraries/public'),
  enumLib = require('../enums/business');
var userLogic  = require('../logics/user');
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
    delete user._doc._id;
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
  var user = req.admin;
  var userInfo = req.body.user_info || req.query.user_info || {};
  if(!userInfo.group_id || !userInfo.username || !userInfo.password){
    return next({err: systemError.param_null_error});
  }
  userInfo.hospital_id = user.hospital;

  userLogic.modifyUser(userInfo, function(err, user){
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

  var newPrice = parseInt(req.body.price) || 0;
  if(!newPrice || newPrice < 0){
    return next({err: userError.price_error});
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

        return autoCallback(null, user);

      });
    },
    onShelf: ['getDoctor', function(autoCallback, result){
      userLogic.setDoctorPrice(req.user, result.getDoctor, newPrice, function(err){
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

//添加号源
exports.addSchedule = function(req, res, next){};
exports.deleteSchedule = function(){};
exports.modifySchedule = function(){};

