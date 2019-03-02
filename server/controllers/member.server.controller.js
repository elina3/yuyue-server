'use strict';
var async = require('async'),
    publicLib = require('../libraries/public'),
    enumLib = require('../enums/business');
var memberLogic  = require('../logics/member');
var systemError = require('../errors/system'),
    memberError = require('../errors/member');

exports.getAllMembers = function(req, res, next){
  memberLogic.getAllMembers({searchKey: req.query.search_key}, req.pagination, function(err, result){
    if(err){
      return next(err);
    }
    req.data = {
      total_count: result.totalCount,
      members: result.members
    };
    return next();
  });
};
exports.getMemberDetail = function(req, res, next){
  var memberId = req.query.member_id || '';
  if(!memberId){
    return next({err: systemError.param_null_error});
  }
  memberLogic.getMemberDetail(memberId, function(err, member){
    if(err){
      return next(err);
    }
    req.data = {
      member: member
    };
    return next();
  });
};

exports.checkMemberByOpenId = function(req, res, next){
  var openId = req.query.open_id || req.body.open_id || '';
  if(!openId){
    return next({err: memberError.no_open_id});
  }
  memberLogic.checkMemberByOpenId(openId, function(err, member){
    if(err){
      return next(err);
    }

    req.data = {
      member: member
    };
    return next();
  });
};


exports.registerAndBindCard = function(req, res, next){
  var openId = req.body.open_id || req.query.open_id || '';
  var memberInfo = req.body.member_info || req.query.member_info || '';
  var wechatInfo = req.body.wechat_info || req.query.wechat_info || '';
  if(!openId){
    return next({err: memberError.no_open_id});
  }

  if(!memberInfo){
    return next({err: memberError.no_member_info});
  }
  memberInfo = JSON.parse(memberInfo);

  if(!wechatInfo){
    return next({err: memberError.no_wechat_info});
  }
  wechatInfo =JSON.parse(wechatInfo);

  if(!memberInfo.nickname){
    return next({err: memberError.no_nickname});
  }
  if(!memberInfo.IDCard){
    return next({err: memberError.member_no_IDCard});
  }
  if(memberInfo.card_type && !memberInfo.card_number){
    return next({err: memberError.member_no_card});
  }
  memberLogic.registerAndBindCard(openId, memberInfo, wechatInfo, function(err, member){
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