'use strict';
var publicLib = require('../libraries/public');
var systemError = require('../errors/system'),
    hospitalError = require('../errors/hospital'),
    hospitalLogic = require('../logics/hospital'),
    departmentLogic = require('../logics/department'),
    jobTitleLogic = require('../logics/job_title');

exports.createHospital = function(req, res, next) {
  var hospitalName = req.body.name || '';
  if (!hospitalName) {
    return next({ err: hospitalError.param_name_null });
  }
  var address = req.body.address || '';
  if (!address) {
    return next({ err: systemError.param_null_error });
  }

  hospitalLogic.createHospital({ name: hospitalName, address: address },
      function(err, newHospital) {
        if (err) {
          return next(err);
        }

        req.data = {
          hospital: newHospital,
        };
        return next();
      });
};
exports.getHospitalDetail = function(req, res, next) {
  req.data = {
    hospital: req.hospital,
  };
  return next();
};

exports.createDepartment = function(req, res, next) {
  var departmentName = req.body.name || '';
  if (!departmentName) {
    return next({ err: hospitalError.param_name_null });
  }

  departmentLogic.createDepartment(
      {
        name: departmentName,
        hospitalId: req.user.hospital,
        description: req.body.description || '',
        opened: publicLib.isTrue(req.body.opened) || false,
        title_pic: req.body.title_pic,
        desc_pic: req.body.desc_pic,
      },
      function(err, newDepartment) {
        if (err) {
          return next(err);
        }

        req.data = {
          department: newDepartment,
        };
        return next();
      });
};
exports.modifyDepartment = function(req, res, next) {
  var modifyName = req.body.name || '';
  if (!modifyName) {
    return next({ err: hospitalError.param_name_null });
  }
  departmentLogic.modifyDepartment(req.department._id,
      {
        name: modifyName,
        description: req.body.description || '',
        opened: publicLib.isTrue(req.body.opened) || false,
        title_pic: req.body.title_pic,
        desc_pic: req.body.desc_pic,
      },
      function(err) {
        if (err) {
          return next(err);
        }

        req.data = {
          success: true,
        };
        return next();
      });
};

exports.deleteDepartment = function(req, res, next) {
  departmentLogic.deleteDepartment(req.department._id, function(err) {
    if (err) {
      return next(err);
    }

    req.data = {
      success: true,
    };
    return next();
  });
};
exports.getDepartmentList = function(req, res, next) {
  departmentLogic.getDepartmentList(req.user.hospital, function(err, list) {
    if (err) {
      return next(err);
    }

    req.data = {
      departments: list,
    };
    return next();
  });
};
exports.getDepartmentDetail = function(req, res, next) {
  req.data = {
    department: req.department,
  };
  return next();
};

exports.createJobTitle = function(req, res, next) {
  var departmentName = req.body.name || '';
  if (!departmentName) {
    return next({ err: systemError.param_null_error });
  }

  jobTitleLogic.createJobTitle(
      {
        name: departmentName,
        hospitalId: req.user.hospital,
        description: req.body.description || '',
      },
      function(err, newDepartment) {
        if (err) {
          return next(err);
        }

        req.data = {
          department: newDepartment,
        };
        return next();
      });
};
exports.editJobTitle = function(req, res, next) {
  var modifyName = req.body.name || '';
  if (!modifyName) {
    return next({ err: hospitalError.param_name_null });
  }
  jobTitleLogic.modifyJobTitle(req.job_title._id,
      { name: modifyName, description: req.body.description || '' },
      function(err) {
        if (err) {
          return next(err);
        }

        req.data = {
          success: true,
        };
        return next();
      });
};

exports.getJobTitleList = function(req, res, next) {
  jobTitleLogic.getJobTitleList(req.user.hospital, function(err, list) {
    if (err) {
      return next(err);
    }

    req.data = {
      job_titles: list,
    };
    return next();
  });
};
exports.getJobTitleDetail = function(req, res, next) {
  req.data = {
    job_title: req.job_title,
  };
  return next();
};

exports.getOpenDepartmentList = function(req, res, next) {
  departmentLogic.getAllOpenDepartments(function(err, departments) {
    if (err) {
      return next(err);
    }

    req.data = {
      departments: departments,
    };
    return next();
  });
};