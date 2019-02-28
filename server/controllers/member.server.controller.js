'use strict';
var async = require('async'),
    publicLib = require('../libraries/public'),
    enumLib = require('../enums/business');
var memberLogic  = require('../logics/member');
var systemError = require('../errors/system'),
    memberError = require('../errors/member');

//微信回调url接口
exports.registerMember = function(req, res, next){
  var openId = req.query.open_id || req.body.open_id || '';
  var wechatInfo = req.body.wechat_info || {};
  if(!openId){
    return next({err: memberError.no_open_id});
  }
  memberLogic.createMemberBaseInfo(openId, wechatInfo, function(err, member){
    if(err){
      return next(err);
    }
    req.data = {
      base_info: member
    };
    return next();
  });
};

exports.completeMemberInfo = function(req, res, next){
  var memberId = req.body.member_id || req.query.member_id || '';
  var memberInfo = req.body.member_info || {};
  memberLogic.bindCard(memberId, memberInfo, function(err, member){
    if(err){
      return next(err);
    }

    req.data = {
      member: member
    };
    return next();
  });
};

exports.unbindCard = function(req, res, next){
  var memberId = req.body.member_id || req.query.member_id || '';
  memberLogic.unbindCard(memberId, function(err, member){
    if(err){
      return next(err);
    }

    req.data = {
      member: member
    };
    return next();
  });
};