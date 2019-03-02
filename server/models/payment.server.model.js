'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

var PaymentSchema = new Schema({
  object: {
    type: String,
    default: 'Payment',
  },
  pay_method: {
    type: String,
    default: 'wechat'
  },
  appointment: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Appointment'
  },
  payment_order: {//支付单号
    type: String,
    required: true
  },
  open_id: {
    type: String,
    required: true
  },
  member: {//用户
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Member'
  },
  IDCard: {//用于搜索 appointment中不会变，member有可能换绑定的身份证，但在付款那刻一定不会变
    type: String,
    required: true,
    index: true
  },
  card_type: {//用于搜索 appointment中不会变，member有可能换绑定的卡，但在付款那刻一定不会变
    type: String
  },
  card_number: {//用于搜索
    type: String
  },
  doctor_schedule: {//预定安排记录
    type: Schema.Types.ObjectId,
    ref: 'DoctorSchedule'
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
  status: {
    type: String,
    enum: ['paid', 'refund', 'unpaid']//已支付/已退款/未支付
  },
  price: {
    type: Number,
    default: 0//单位：分。人民币
  },
  paid: {//是否支付
    type: Boolean
  },
  paid_time: {//支付时间
    type: Date
  },
  refund: {//是否退款
    type: Boolean
  },
  refund_time: {//退款时间
    type: Date
  }
});
PaymentSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('Payment', PaymentSchema);
