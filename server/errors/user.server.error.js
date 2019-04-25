/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  user_exist: {type: 'user_exist', message: 'This user is exist!', zh_message: '该用户已存在'},
  group_exist: {type: 'group_exist', message: 'This group is exist', zh_message: '该组已存在'},
  hospital_not_exist: {type: 'hospital_not_exist', message: 'The hospital is not exist', zh_message: '该医院不存在'},
  group_not_exist: {type: 'group_not_exist', message: 'This group is not exist', zh_message: '该组不存在'},
  group_id_null: {type: 'group_id_null', message: 'Group id is null', zh_message: '该组id为空'},
  user_not_exist: {type: 'user_not_exist', message: 'The user is not exist', zh_message: '用户不存在'},
  user_deleted: {type: 'user_deleted', message: 'The user has been deleted', zh_message: '用户已删除'},
  admin_exist: {type: 'admin_exist', message: 'The admin is exist', zh_message: '管理员账户已存在'},
  terminal_type_not_exist: {type: 'terminal_type_not_exist', message: 'The terminal type is not exist', zh_message: '该登录端不存在！'},
  no_terminal_permission: {type: 'no_terminal_permission', message: 'No permission for this terminal', zh_message: '您没有登录该系统的权限，请联系管理员！'},
  not_a_doctor: {type: 'not_a_doctor', message: 'The user is not a doctor', zh_message: '该用户不是医生！'},
  doctor_on_shelf: {type: 'doctor_on_shelf', message: 'The doctor has been on shelf', zh_message: '该医生已上架'},
  doctor_off_shelf: {type: 'doctor_off_shelf', message: 'The doctor has been off shelf', zh_message: '该医生已下架'},
  doctor_no_price: {type: 'doctor_no_price', message: 'The doctor has not set the price', zh_message: '该医生还未设置挂号费'},
  doctor_no_special_price: {type: 'doctor_no_special_price', message: 'The doctor has not set the special price', zh_message: '该医生还未设置特需费用'},
  no_price_type: {type: 'no_price_type', message: 'The price type is not exist', zh_message: '这种费用类型不存在'},
  price_error: {type: 'price_error', message: 'The price is error', zh_message: '挂号费不合法'},
  start_end_time_invalid: {type: 'start_end_time_invalid', message: 'The time range is invalid', zh_message: '开始时间必须早于结束时间'},
  schedule_number_count_error: {type: 'schedule_number_count_error', message: 'The schedule number count set error', zh_message: '医生的号源数量设置不合法'},
  time_range_repeat: {type: 'time_range_repeat', message: 'The schedule time range is repeat', zh_message: '时间范围有重叠'},
  doctor_schedule_not_exist: {type: 'doctor_schedule_not_exist', message: 'The doctor schedule is not exist', zh_message: '该医生的时间安排记录不存在'},
  username_exist: {type: 'username_exist', message: 'The username has been exist', zh_message: '该用户工号已存在'},
  IDCard_exist: {type: 'IDCard_exist', message: 'The IDCard has been binded', zh_message: '该用户身份证已绑定其他账号！'},
  has_booked_not_delete: {type: 'has_booked_not_delete', message: 'The schedule has not deleted', zh_message: '该号源已经有人预定不能删除！'},
  at_least_one: {type: 'at_least_one', message: 'The schedule at least one', zh_message: '至少传递一条数据！'},
  username_null: {type: 'username_null', message: 'The username is null', zh_message: 'username 参数为空！'},
});
