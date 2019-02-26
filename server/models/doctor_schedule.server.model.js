'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

var DoctorScheduleSchema = new Schema({
  object: {
    type: String,
    default: 'DoctorSchedule',
  },
  user: {//医生user的_id
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  date: {//日期 2019/1/31 00:00:00
    type: Date,
    required: true
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
  }
});
DoctorScheduleSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('DoctorSchedule', DoctorScheduleSchema);
