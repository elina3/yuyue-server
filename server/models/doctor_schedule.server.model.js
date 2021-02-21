'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');
var enumLib = require('../enums/business');
var outpatientTypeEnums = enumLib.outpatient_types.enums;

var DoctorScheduleSchema = new Schema({
  object: {
    type: String,
    default: 'DoctorSchedule',
  },
  doctor: {//医生user的_id
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  outpatient_type: {
    type: String,
    enum: outpatientTypeEnums,//专家门诊，普通门诊
  },//门诊类型
  price_type: {type: String},//普通价格，特殊价格
  price: {//单位：分
    type: Number
  },
  date_string: {//2019/1/31
    type: String,
    required: true
  },
  start_time: {// 2019/1/31 9:00:00
    type: Date,
    required: true
  },
  start_time_string: {
    type: String,
    required: true
  },
  end_time: {// 2019/1/31 10:00:00
    type: Date,
    required: true
  },
  end_time_string: {
    type: String,
    required: true
  },
  number_count: {
    type: Number
  },
  operator_user: {
    type: Schema.Types.ObjectId
  },
  is_stopped: {
    type: Boolean,
    default: false
  },
  stopped_time: {
    type: Date
  },
  recent_repeat_start_time: {
    type: Date
  }
});
DoctorScheduleSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('DoctorSchedule', DoctorScheduleSchema);
