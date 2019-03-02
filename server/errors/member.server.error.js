/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var _ = require('lodash');

module.exports = _.extend(exports, {
  no_member_info: {type: 'no_member_info', message: 'There is no member info here!', zh_message: '您还没有完善信息，请先完善个人信息！'},
  member_no_IDCard: {type: 'member_no_IDCard', message: 'The member has no IDCard!', zh_message: '您还没有绑定身份证号！'},
  member_no_card: {type: 'member_no_card', message: 'This member has not bind the card!', zh_message: '您还没有绑卡，请绑定就诊卡或者医保卡！'},
  member_not_exist: {type: 'member_not_exist', message: 'This member is not exist', zh_message: '该用户不存在！'},
  no_open_id: {type: 'no_open_id', message: 'The param of openg_id is not exist', zh_message: '参数open_id为空'}
});
