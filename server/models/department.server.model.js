/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';


var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');


//科室
var departmentSchema = new Schema({
  object:{
    type:String,
    default:'Department'
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  deleted_status: {
    type: Boolean,
    default: false
  },
  delete_time: {
    type: Date
  },
  opened: {//对外展示（微信可见）
    type: Boolean,
    default: false
  },
  canOrder: {//微信端可以预约
    type: Boolean,
    default: false
  },
  canView: {//微信端可以查看
    type: Boolean,
    default: false
  },
  title_pic: {//key
    type: String
  },
  desc_pic: {//key
    type: String
  }
});


departmentSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Department', departmentSchema);
