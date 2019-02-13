/**
 * Created by elinaguo on 16/2/26.
 */
'use strict';
var hospitalError = require('../errors/hospital');
var hospitalLogic = require('../logics/hospital');

exports.requireHospital = function(req, res, next){
  var hospitalId = req.body.hospital_id || req.query.hospital_id;
  hospitalLogic.getHospitalDetail(hospitalId, function(err, hospital){
    if(err){
      return next(err);
    }

    if(!hospital){
      return next({err: hospitalError.hospital_not_exists});
    }

    req.hospital = hospital;
    next();
  });
};

exports.requireDepartment = function(req, res, next){
  var departmentId = req.body.department_id || req.query.department_id;
  hospitalLogic.getDepartmentDetail(departmentId, function(err, department){
    if(err){
      return next(err);
    }

    if(!department){
      return next({err: hospitalError.department_not_exists});
    }

    req.department = department;
    next();
  });
};