'use strict';

var systemError = require('../errors/system'),
    hospitalError = require('../errors/hospital');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var JobTitleModel = appDb.model('JobTitle');

exports.createJobTitle = function(jobTitleInfo, callback) {
  JobTitleModel.findOne(
      { hospital: jobTitleInfo.hospitalId, name: jobTitleInfo.name }).
      exec(function(err, jobTitle) {
        if (err) {
          console.log(err);
          return callback({ err: systemError.database_query_error });
        }

        if (jobTitle) {
          return callback({ err: hospitalError.job_title_exists }, jobTitle);
        }

        jobTitle = new JobTitleModel({
          name: jobTitleInfo.name,
          hospital: jobTitleInfo.hospitalId,
          description: jobTitleInfo.description || '',
        });
        jobTitle.save(function(err, saved) {
          if (err) {
            console.log(err);
            return callback({ err: systemError.database_save_error });
          }
          return callback(null, saved);
        });
      });
};

exports.getJobTitleList = function(hospitalId, callback){
  JobTitleModel.find({ hospital: hospitalId, deleted_status: false})
  .exec(function(err, jobTitle) {
    if (err) {
      return callback({ err: systemError.database_query_error });
    }

    return callback(null, jobTitle);
  });
};

exports.modifyJobTitle = function(jobTitleId, jobTitleInfo, callback){
  JobTitleModel.findOne({_id: {$ne: jobTitleId}, name: jobTitleInfo.name}, function(err, jobTitle){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    if(jobTitle){
      return callback({err: hospitalError.job_title_exists});
    }

    JobTitleModel.update({_id: jobTitleId}, {$set: {name: jobTitleInfo.name, description: jobTitleInfo.description || '', update_time: new Date()}}, function(err){
      if(err){
        return callback({err: systemError.database_update_error});
      }

      return callback();
    });
  });
};

exports.getJobTitleDetail = function(jobTitleId, callback) {
  JobTitleModel.findOne({ _id: jobTitleId }).exec(function(err, jobTitle) {
    if (err) {
      return callback({ err: systemError.database_query_error });
    }

    return callback(null, jobTitle);
  });
};