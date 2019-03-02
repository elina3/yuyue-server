/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var _ = require('lodash');

module.exports = _.extend(exports, {
  no_payment_method: {type: 'no_payment_method', message: 'There is no payment method!', zh_message: '您没有选支付方式'},
  has_booked: {type: 'has_booked', message: 'You have made the appointment!', zh_message: '您已经预约过该时间段'},
  schedule_out_of_limit: {type: 'schedule_out_of_limit', message: 'The time range has been out!', zh_message: '该时间段已经预约满了！'},
  appointment_over: {type: 'appointment_over', message: 'The appointment is over!', zh_message: '该预约时间端已过，请重新选择时间段预约！'},
  appoitment_not_exist: {type: 'appoitment_not_exist', message: 'The appointment is not exist!', zh_message: '该预约不存在！'},
});
