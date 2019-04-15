/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var _ = require('lodash');

module.exports = _.extend(exports, {
  no_member_info: {type: 'no_member_info', message: 'There is no member info here!', zh_message: '您还没有完善信息，请先完善个人信息！'},
  no_wechat_info: {type: 'no_wechat_info', message: 'There is no wechat info here!', zh_message: '没有微信信息！'},
  no_nickname: {type: 'no_nickname', message: 'The param of nickname is null!', zh_message: '姓名未填！'},
  member_no_IDCard: {type: 'member_no_IDCard', message: 'The member has no IDCard!', zh_message: '您还没有绑定身份证号！'},
  member_no_card: {type: 'member_no_card', message: 'This member has not bind the card!', zh_message: '您选择了就诊卡类型则必须填写卡号！'},
  member_not_exist: {type: 'member_not_exist', message: 'This member is not exist', zh_message: '该用户不存在！'},
  no_open_id: {type: 'no_open_id', message: 'The param of openg_id is not exist', zh_message: '参数open_id为空'},
  neither_nor_CardNumber: {type: 'neither_nor_CardNumber', message: 'There is nether ID nor card number', zh_message: '没有绑卡也没有绑身份证号'},
  report_not_exist: {type: 'report_not_exist', message: 'The report is not exist', zh_message: '该报告不存在'},
  no_report_type: {type: 'no_report_type', message: 'The report type is not exist', zh_message: '该报告类型不存在'},
  no_report_id: {type: 'no_report_id', message: 'The param of report_id is null', zh_message: '参数report_id不存在'},
  card_number_binded: {type: 'card_number_binded', message: 'The card number has binded ', zh_message: '该卡号已经绑定微信'},
  IDCard_binded: {type: 'IDCard_binded', message: 'The IDCard has binded ', zh_message: '该身份证号已经绑定微信'},
});
