/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';


var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  timestamps = require('mongoose-timestamp');


var hospitalSchema = new Schema({
  object:{
    type:String,
    default:'Hospital'
  },
  name: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    default: ''
  }
});


hospitalSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('Hospital', hospitalSchema);
