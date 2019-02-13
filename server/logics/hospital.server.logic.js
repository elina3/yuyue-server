'use strict';

var systemError = require('../errors/system'),
    hospitalError = require('../errors/hospital');
var mongoLib = require('../libraries/mongoose');
var appDb = mongoLib.appDb;
var HospitalModel = appDb.model('Hospital');

exports.createHospital = function(hospitalInfo, callback) {
  HospitalModel.findOne({ name: hospitalInfo.name}).
      exec(function(err, hospital) {
        if (err) {
          return callback({ err: systemError.database_query_error });
        }

        if (hospital) {
          return callback({ err: hospitalError.hospital_exists }, hospital);
        }

        hospital = new HospitalModel({
          name: hospitalInfo.name,
          address: hospitalInfo.address
        });
        hospital.save(function(err, saved) {
          if (err) {
            return callback({ err: systemError.database_save_error });
          }
          return callback(null, saved);
        });
      });
};

exports.getHospitalDetail = function(hospitalId, callback) {
  HospitalModel.findOne({ _id: hospitalId }).exec(function(err, hospital) {
    if (err) {
      return callback({ err: systemError.database_query_error });
    }

    return callback(null, hospital);
  });
};