'use strict';
var async = require('async');
var systemError = require('../errors/system');
var memberError = require('../errors/member');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var Member = appDb.model('Member');

exports.isMember = function(openId, callback){
  Member.findOne({open_id: openId})
      .exec(function(err, member){
        if(err){
          return callback({err: systemError.database_query_error});
        }

        if(!member){
          return callback(null, false);
        }

        if(!member.IDCard){
          return callback(null, false);
        }

        return callback(null, true);
  });
};
exports.createMemberBaseInfo = function(openId, wechatInfo, callback){
  Member.findOne({open_id: openId})
      .exec(function(err, member){
        if(err){
          console.log(err);
          return callback({err: systemError.database_query_error});
        }

        if(member && !wechatInfo){//有member基本信息，没有微信详情信息直接返回
          return callback(null, member);
        }

        if(!member){
          member = new Member({
            open_id: openId
          });
        }

        if(wechatInfo){//有微信信息更新微信信息
          member.wechat_info = wechatInfo;
        }
        member.save(function(err, newMember){
          if(err){
            return callback({err: systemError.database_save_error});
          }
          return callback(null, newMember);
        });
  });
};
exports.bindCard = function(memberId, memberInfo, callback){
  if(!memberInfo){
    return callback({err: memberError.no_member_info});
  }
  Member.findOne({_id: memberId})
  .exec(function(err, member){
    if(err){
      console.log(err);
      return callback({err: systemError.database_query_error});
    }

    if(!member){
      return callback({err: memberError.member_not_exist});
    }

    member.nickname = memberInfo.nickname;
    member.IDCard = memberInfo.IDCard;
    member.sex = memberInfo.sex;
    member.mobile_phone = memberInfo.mobile_phone;
    member.card_type = memberInfo.card_type || 'none';
    member.card_number = memberInfo.card_number || '';
    member.save(function(err, newMember){
      if(err){
        return callback({err: systemError.database_save_error});
      }
      return callback(null, newMember);
    });
  });
};
exports.unbindCard = function(memberId, callback){
  Member.findOne({_id: memberId})
      .exec(function(err, member){
        if(err){
          return callback({err: systemError.database_query_error});
        }

        if(!member){
          return callback({err: memberError.member_not_exist});
        }

        let updateObj = {
          IDCard: '',
          nickname: '',
          sex: '',
          mobile_phone: '',
          card_type: 'none',
          card_number: ''
        };
        Member.update({_id: memberId}, {$set: updateObj}, function(err){
          if(err){
            return callback({err: systemError.database_update_error});
          }

          return callback();
        });
  });
};
