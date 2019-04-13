'use strict';
var InspectReport = require('../models/sqlserver/inspect_report');
exports.getReports = function(callback){
  InspectReport.findAll()
      .then((res)=>{
        console.log(res);
        return callback(null, res);
  });
};