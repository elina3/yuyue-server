'use strict';
var cryptoLib = require('../libraries/crypto'),
    publicLib = require('../libraries/public');

var systemError = require('../errors/system');
var hospitalLogic = require('../logics/hospital');

exports.createHospital = function(req, res, next){
  var hospitalName = req.body.name || '';
  if(!hospitalName){
    return next({err: systemError.param_null_error});
  }
  var address = req.body.address || '';
  if(!address){
    return next({err: systemError.param_null_error});
  }

  hospitalLogic.createHospital({name: hospitalName, address: address}, function(err, newHospital){
    if(err){
      return next(err);
    }

    req.data = {
      hospital: newHospital
    };
    return next();
  });
};
exports.getHospitalDetail = function(req, res, next){

};

exports.createDepartment = function(req, res, next){
  var departmentName = req.body.name || '';
  if(!departmentName){
    return next({err: systemError.param_null_error});
  }
  var hospitalId = req.body.hospital_id || '';
  if(!hospitalId){
    return next({err: systemError.param_null_error});
  }

  hospitalLogic.createDepartment({name: departmentName, hospitalId: hospitalId}, function(err, newDepartment){
    if(err){
      return next(err);
    }

    req.data = {
      department: newDepartment
    };
    return next();
  });
};