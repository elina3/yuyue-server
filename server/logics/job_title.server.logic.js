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

exports.getJobTitleDetail = function(jobTitleId, callback) {
  JobTitleModel.findOne({ _id: jobTitleId }).exec(function(err, jobTitle) {
    if (err) {
      return callback({ err: systemError.database_query_error });
    }

    return callback(null, jobTitle);
  });
};