'use strict';
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');

var MemberSchema = new Schema({
  object: {
    type: String,
    default: 'Member',
  },
  open_id: {//绑定wechat的唯一值
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  wechat_info: {
    type: Schema.Types.Mixed
  },
  IDCard: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown',
  },
  mobile_phone: {
    type: String,
    required: true
  },
  head_photo: {
    type: String,
  },
  card_type: {
    type: String,
    enum: ['health_care', 'medical', 'none']//医保/诊疗/无
  },
  card_number: {
    type: String
  },
  deleted_status:{
    type: Boolean,
    default: false
  }
});

MemberSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('Member', MemberSchema);
