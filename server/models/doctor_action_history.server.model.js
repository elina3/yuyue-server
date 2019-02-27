'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

var DoctorActionHistorySchema = new Schema({
  object: {
    type: String,
    default: 'DoctorActionHistory',
  },
  doctor: {//变动的医生
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  change_user: {//操作人员
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    enum: ['set_price', 'on_shelf', 'off_shelf', 'add_schedule', 'delete_schedule', 'update_schedule']
  },
  extend_data: {//日期 2019/1/31 00:00:00
    type: Schema.Types.Mixed
  },
  operator_time: {
    type: Date
  }
});
DoctorActionHistorySchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('DoctorActionHistory', DoctorActionHistorySchema);
