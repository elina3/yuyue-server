/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var systemError = require('../errors/system');
var userError = require('../errors/user');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var User = appDb.model('User');



exports.signUp = function(userInfo, callback){
  Group.findOne({_id: userInfo.group_id})
    .exec(function(err, group){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!group){
        return callback({err: userError.group_not_exist});
      }

      User.findOne({username: userInfo.username})
        .exec(function(err, user){
          if(err){
            return callback({err: systemError.internal_system_error});
          }

          if(user && !user.deleted_status){
            return callback({err: userError.user_exist});
          }

          if(!user){
            user = new User();
          }
          user.username = userInfo.username ? userInfo.username : '';
          user.password = userInfo.password ? user.hashPassword(userInfo.password) : '';
          user.nickname = userInfo.nickname;
          user.role = userInfo.role;
          user.group = userInfo.group_id;
          user.hospital = group.hospital;
          user.sex = !userInfo.sex ? 'unknown':userInfo.sex;
          user.mobile_phone = userInfo.mobile_phone;
          user.head_photo = userInfo.head_photo;
          user.description = userInfo.description;
          user.save(function(err, newUser){
            if(err || !newUser){
              return callback({err: systemError.database_save_error});
            }

            return callback(null, newUser);
          });
        });
    });
};

exports.modifyUser = function(userInfo, callback){
  User.findOne({username: userInfo.username},function(err, user){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(!user){
      return callback({err: userError.user_not_exist});
    }

    if(userInfo.password_modify){
      user.password = userInfo.password ? user.hashPassword(userInfo.password) : '';
    }
    user.nickname = userInfo.nickname;
    user.role = userInfo.role;
    user.group = userInfo.group_id;
    user.sex = !userInfo.sex ? 'unknown':userInfo.sex;
    user.mobile_phone = userInfo.mobile_phone;
    user.head_photo = userInfo.head_photo;
    user.description = userInfo.description;
    user.save(function(err, newUser){
      if(err || !newUser){
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newUser);
    });

  });
};

exports.deleteUser = function(userId, callback){
  User.findOne({_id: userId}, function(err, user){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(!user){
      return callback({err: userError.user_not_exist});
    }

    if(user.deleted_status){
      return callback({err: userError.user_deleted});
    }

    user.deleted_status = true;
    user.save(function(err, newUser){
      if(err || !newUser){
        return callback({err: systemError.database_save_error});
      }

      return callback(null, newUser);
    });
  });
};

exports.signIn = function(username, password, callback){
  User.findOne({username: username})
    .populate('group hospital')
    .exec(function(err, user){
      if(err){
        return callback({err: systemError.internal_system_error});
      }

      if(!user){
        return callback({err: userError.user_not_exist});
      }

      if (!user.authenticate(password)) {
        return callback({err: systemError.account_not_match});
      }

      return callback(null, user);
    });
};

