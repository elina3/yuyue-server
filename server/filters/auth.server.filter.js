'use strict';
var cryptoLib = require('../libraries/crypto');
var systemError = require('../errors/system');
var userLogic = require('../logics/user');
var memberLogic = require('../logics/member');

exports.requireAdmin = function(req, res, next){
  var token;
  token = req.body.access_token || req.query.access_token;

  req.connection = req.connection || {};
  req.socket = req.socket || {};
  req.connection.socket = req.connection.socket || {};

  if (!token){
    return res.send({err: systemError.undefined_access_token});
  }

  try {
    token = cryptoLib.decrpToken(token, 'secret1');
  }
  catch (e) {
    return res.send({err: systemError.invalid_access_token});
  }

  userLogic.getUserById(token._id, function(err, user){
    if(err){
      return next(err);
    }

    if(user.role !== 'admin'){
      return next({err: systemError.no_permission});
    }

    req.admin = user;
    req.user = user;

    req.body.hospital_id = req.user.hospital;
    next();
  });
};

exports.requireUser = function(req, res, next){
  var token;
  token = req.body.access_token || req.query.access_token;

  req.connection = req.connection || {};
  req.socket = req.socket || {};
  req.connection.socket = req.connection.socket || {};

  if (!token){
    return res.send({err: systemError.undefined_access_token});
  }

  try {
    token = cryptoLib.decrpToken(token, 'secret1');
  }
  catch (e) {
    return res.send({err: systemError.invalid_access_token});
  }

  userLogic.getUserById(token._id, function(err, user){
    if(err){
      return next(err);
    }

    req.user = user;
    req.body.hospital_id = req.user.hospital;
    next();
  });
};


exports.requireUserById = function(req, res, next){
  var userId = req.query.user_id || req.body.user_id || '';
  if(!userId){
    return next({err: systemError.param_null_error});
  }
  userLogic.getUserById(userId, function(err, user){
    if(err){
      return next(err);
    }

    req.user = user;
    next();
  });
};

exports.requireUserDetailById = function(req, res, next){
  var userId = req.body.user_id || req.query.user_id;
  userLogic.getUserDetailById(userId, function(err, user){
    if(err){
      return next(err);
    }


    req.detail_user = user;
    req.body.hospital_id = req.detail_user.hospital;
    next();
  });
};

exports.requireMemberByOpenId = function(req, res, next){
  var openId = req.body.open_id || req.query.open_id || '';
  memberLogic.getMemberInfoByOpenId(openId, function(err, member){
    if(err){
      return next(err);
    }

    req.member = member;
    next();
  });
};