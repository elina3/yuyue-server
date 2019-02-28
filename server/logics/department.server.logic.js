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
          description: departmentInfo.description,
          opened: departmentInfo.opened
        });
        department.save(function(err, saved) {
          if (err) {
            return callback({ err: systemError.database_save_error });
          }
          return callback(null, saved);
        });
      });
};

exports.modifyDepartment = function(departmentId, departmentInfo, callback){
  DepartmentModel.update({_id: departmentId}, {$set: {name: departmentInfo.name, description: departmentInfo.description || '', update_time: new Date()}}, function(err){
    if(err){
      return callback({err: systemError.database_update_error});
    }

    return callback();
  });
};
exports.deleteDepartment = function(departmentId, callback){
  DepartmentModel.update({_id: departmentId}, {$set: {deleted_status: true, delete_time: new Date()}}, function(err){
    if(err){
      return callback({err: systemError.database_update_error});
    }

    return callback();
  });
};
exports.getDepartmentList = function(hospitalId, callback){
  DepartmentModel.find({hospital: hospitalId, deleted_status: false}, function(err, list){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    return callback(null, list);
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

exports.getAllOpenDepartments = function(callback){
  DepartmentModel.find({deleted_status: false}, function(err, list){
    if(err){
      return callback({err: systemError.database_query_error});
    }

    return callback(null, list);
  });
};