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
  client: {//用户
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Client'
  },
  IDCard: {
    type: String,
    required: true,
    index: true
  },
  card_type: {//就诊卡类型
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
  paid: {//是否支付
    type: Boolean
  },
  printed: {
    type: Boolean
  }
});
AppointmentSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('Appointment', AppointmentSchema);
