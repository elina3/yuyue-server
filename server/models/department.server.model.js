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
  }
});


departmentSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Department', departmentSchema);
