/**
 * Created by elinaguo on 16/2/23.
 */
'use strict';


var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    timestamps = require('mongoose-timestamp');


//职称
var jobTitleSchema = new Schema({
  object:{
    type:String,
    default:'JobTitle'
  },
  hospital: {
    type: Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  name: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    default: ''
  }
});


jobTitleSchema.plugin(timestamps, {
  createdAt: 'create_time',
  updatedAt: 'update_time'
});

appDb.model('JobTitle', jobTitleSchema);
