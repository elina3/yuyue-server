'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var enumLib = require('../enums/business');
var roleEnums = enumLib.user_roles.enums;
var outpatientTypeEnums = enumLib.outpatient_types.enums;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp'),
    cryptoLib = require('../libraries/crypto'),
    crypto = require('crypto');

var ClientSchema = new Schema({
  object: {
    type: String,
    default: 'Client',
  },
  IDCard: {
    type: String,
    required: true,
    unique: true
  },
  open_id: {//绑定wechat的唯一值
    type: String,
    trim: true,
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
  }
});

ClientSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('Client', ClientSchema);
