'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

//号源设置表，根据此表来自动生成医生的号源
var ScheduleSettingSchema = new Schema({
  object: {
    type: String,
    default: 'ScheduleSetting',
  },
  doctor: {//医生user的_id
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
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
  cycle: {//重复周期
    type: Number
  },
  published: {//是否发布，已发布才执行
    type: Boolean,
    default: false
  }
});
ScheduleSettingSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('ScheduleSetting', ScheduleSettingSchema);
