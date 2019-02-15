/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var cryptoLib = require('../libraries/crypto');
var systemError = require('../errors/system');
var userLogic = require('../logics/user');

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