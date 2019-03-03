'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

var AppointmentSchema = new Schema({
  object: {
    type: String,
    default: 'Appointment',
  },
  order_number: {
    type: String,
    required: true,
    index: true
  },
  member: {//用户
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Member'
  },
  IDCard: {//member有可能换绑定的身份证，但在付款那刻一定不会变
    type: String,
    required: true,
    index: true
  },
  nickname: {
    type: String
  },
  card_type: {//就诊卡类型 //member有可能换绑定的卡，但在付款那刻一定不会变
    type: String
  },
  card_number: {//就诊卡号
    type: String
  },
  doctor_schedule: {//预定安排记录
    type: Schema.Types.ObjectId,
    ref: 'DoctorSchedule'
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },//医生
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  start_time: {// 2019/1/31 9:00:00
    type: Date,
    required: true
  },
  end_time: {// 2019/1/31 10:00:00
    type: Date,
    required: true
  },
  appointment_time: {
    type: Date,
    required: true
  },
  pay_method: {
    type: String,
    enum: ['wechat', 'offline']
  },
  status: {
    type: String,
    enum: ['booking', 'booked', 'picked_up', 'over_number', 'canceled']//预定中，已预定，已取号，已过号，已取消
  },
  price: {
    type: Number//金额：分
  },
  paid: {//是否支付
    type: Boolean
  },
  paid_time: {
    type: Date
  },
  picked: {
    type: Boolean,
    default: false
  },
  picked_time: {
    type: Date
  },
  picked_user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  printed: {
    type: Boolean
  },
  print_time: {
    type: Date
  },
  canceled: {
    type: Boolean,
    default: false
  },
  canceled_time: {
    type: Date
  }
});
AppointmentSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('Appointment', AppointmentSchema);
