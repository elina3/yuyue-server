/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';

var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp'),
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
    enum: ['admin'],//管理员
  },
  terminalType: {
    type: String,
    enum: ['management', 'doctor', 'pick-up'],//管理端，医生端，取号端
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  jobTitle: {
    type: Schema.Types.ObjectId,
    ref: 'JobTitle'
  },
  salt: {
    type: String,
    default: 'secret',
  },
  deleted_status: {
    type: Boolean,
    default: false,
  }
});

UserSchema.methods.hashPassword = function(password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
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
