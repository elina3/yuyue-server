'use strict';
var async = require('async');
var systemError = require('../errors/system');
var memberError = require('../errors/member');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var Member = appDb.model('Member');

exports.getAllMembers = function(filter, pagination, callback){
  var query = { deleted_status: false };
  if (filter.searchKey) {
    query.$or = [
      { mobile_phone: { $regex: filter.searchKey, $options: '$i' } },
      { IDCard: { $regex: filter.searchKey, $options: '$i' } },
      { nickname: { $regex: filter.searchKey, $options: '$i' } }
    ];
  }
  Member.count(query, function(err, totalCount) {
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

    Member.find(query).
        sort({ update_time: -1 }).
        skip(pagination.skip_count).
        limit(pagination.limit).
        exec(function(err, members) {
          if (err) {
            return callback({ err: systemError.database_query_error });
          }

          return callback(null, { totalCount: totalCount, members: members });
        });
  });
};

exports.getMemberDetail = function(memberId, callback){
  Member.findOne({_id: memberId})
      .exec(function(err, member){
        if(err){
          return callback({err: systemError.database_query_error});
        }

        if(!member){
          return callback({err: memberError.member_not_exist});
        }

        return callback(null, member);
  });
};

exports.checkMemberByOpenId = function(openId, callback){
  Member.findOne({open_id: openId})
  .exec(function(err, member){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(!member){
      return callback();
    }

    return callback(null, member);
  });
};

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
exports.getMemberInfoByOpenId = function(openId, callback){
  Member.findOne({open_id: openId})
  .exec(function(err, member){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(!member){
      return callback({err: memberError.member_not_exist});
    }

    return callback(null, member);
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
            console.error(err)
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
