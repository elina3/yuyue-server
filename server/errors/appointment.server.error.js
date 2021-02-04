/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var _ = require('lodash');

module.exports = _.extend(exports, {
  no_payment_method: {type: 'no_payment_method', message: 'There is no payment method!', zh_message: '您没有选支付方式'},
  has_booked: {type: 'has_booked', message: 'You have made the appointment!', zh_message: '您已经预约过该时间段'},
  schedule_out_of_limit: {type: 'schedule_out_of_limit', message: 'The time range has been out!', zh_message: '该时间段已经预约满了！'},
  doctor_schedule_stopped: {type: 'doctor_schedule_stopped', message: "The doctor schedule is stopped", zh_message: '很抱歉，该时间段医生已停诊'},
  appointment_over: {type: 'appointment_over', message: 'The appointment is over!', zh_message: '该预约时间端已过，请重新选择时间段预约！'},
  appointment_not_exist: {type: 'appointment_not_exist', message: 'The appointment is not exist!', zh_message: '该预约不存在！'},
  id_card_order_number_error: {type: 'id_card_order_number_error', message: 'The IDCard and order_number are both null!', zh_message: '身份证号或预约号至少有一个存在！'},
  no_appointment_id: {type: 'no_appointment_id', message: 'There is no appointment_id param!', zh_message: 'appointment_id参数为空！'},
  has_been_picked: {type: 'has_been_picked', message: 'The appointment has been picked!', zh_message: '该预约已取号，您不能执行此操作！！'},
  has_been_canceled: {type: 'has_been_canceled', message: 'The appointment has been canceled!', zh_message: '该预约已经取消，您不能执行此操作！'},
  no_permission_to_cancel: {type: 'no_permission_to_cancel', message: 'You have not the permission to cancel other\'s appointment!', zh_message: '您没有权限取消他人的订单！'},
  not_cancel_for_over_time: {type: 'not_cancel_for_over_time', message: 'You can not cancel the appointment because of out of the time you booked!', zh_message: '已经过了可取消订单的时间，请在预约时间以前取消！'},
  no_more_than_16: {type: 'no_more_than_16', message: 'You are no more than 16!', zh_message: '很抱歉，未满16岁不能预约！'},
});
