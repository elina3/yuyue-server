/**
 * Created by elinaguo on 16/2/23.
 */
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

var UserSchema = new Schema({
  object: {
    type: String,
    default: 'User',
  },
  username: {//工号
    type: String,
    trim: true,
    required: true,
  },
  nickname: {
    type: String,
  },
  password: {
    type: String,
    trim: true,
    required: true,
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
  role: {
    type: String,
    enum: roleEnums,
    default: 'admin'
  },
  outpatient_type: {//role角色为doctor时，有门诊类型
    type: String,
    enum: outpatientTypeEnums,//专家门诊，普通门诊
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  job_title: {
    type: Schema.Types.ObjectId,
    ref: 'JobTitle'
  },
  good_at: {
    type: String
  },
  brief: {
    type: String
  },
  salt: {
    type: String,
    default: 'secret',
  },
  deleted_status: {
    type: Boolean,
    default: false,
  },
  delete_time: {
    type: Date
  },
  terminal_types: [{
    type: String,
    enum: ['manager', 'doctor', 'pick_up'],//管理端，医生端，取号端
  }],
  IDCard: {
    type: String//身份证号
  },

  //例子：permission:
    // {manager: [
    //   {id: '1a', text: '首页', selected: true},
    //   {id: '1b', text: '用户管理', selected: true},
    //   {id: '1c', text: '科室管理', selected: true},
    //   {id: '1d', text: '职称管理', selected: true},
    //   {id: '1e', text: '账单管理', selected: true},
    //   {id: '1f', text: '就诊卡管理', selected: true},
    //   {id: '1g', text: '页面管理', selected: true},
    // ],
    // doctor: [
    //   {id: '2a', text: '排班管理', selected: true}
    // ],
    // pick_up: [
    //   {id: '3a', text: '取号打印', selected: true}
    // ]}
  permission: {
    type: Schema.Types.Mixed,
    default: {
      manager: [
        {id: '1a', text: '首页', selected: true},
        {id: '1b', text: '用户管理', selected: true},
        {id: '1c', text: '科室管理', selected: true},
        {id: '1d', text: '职称管理', selected: true},
        {id: '1e', text: '账单管理', selected: true},
        {id: '1f', text: '就诊卡管理', selected: true},
        {id: '1g', text: '页面管理', selected: true},
      ],
      doctor: [
        {id: '2a', text: '排班管理', selected: true}
      ],
      pick_up: [
        {id: '3a', text: '取号打印', selected: true}
      ]
    }
  },
  on_shelf: {//role为doctor时，有上架
    type: Boolean,
    default: false,
  },
  price: {//role为doctor时，有挂号费价格
    type: Number
  },
  recent_modify_user: {
    type: Schema.Types.ObjectId
  }
});

UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    // return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
    return cryptoLib.encryptString(password, this.salt);
  } else {
    return password;
  }
};

UserSchema.methods.authenticate = function(password) {
  return this.password === this.hashPassword(password);
};

UserSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time',
});

appDb.model('User', UserSchema);
