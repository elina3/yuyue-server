'use strict';

var systemError = require('../errors/system'),
    hospitalError = require('../errors/hospital');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var DepartmentModel = appDb.model('Department');

exports.createDepartment = function(departmentInfo, callback) {
  DepartmentModel.findOne({ hospital: departmentInfo.hospitalId, name: departmentInfo.name })
  .exec(function(err, department) {
        if (err) {
          return callback({ err: systemError.database_query_error });
        }

        if (department) {
          return callback({ err: hospitalError.department_exists }, department);
        }

        department = new DepartmentModel({
          name: departmentInfo.name,
          hospital: departmentInfo.hospitalId,
          description: departmentInfo.description
        });
        department.save(function(err, saved) {
          if (err) {
            return callback({ err: systemError.database_save_error });
          }
          return callback(null, saved);
        });
      });
};

exports.getDepartmentDetail = function(departmentId, callback) {
  DepartmentModel.findOne({ _id: departmentId }).exec(function(err, hospital) {
    if (err) {
      return callback({ err: systemError.database_query_error });
    }

    return callback(null, hospital);
  });
};