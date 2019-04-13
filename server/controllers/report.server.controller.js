'use strict';
let reportLogic = require('../logics/report');
let memberError = require('../errors/member');
exports.test = function(req, res, next){
  reportLogic.getReports((err, res)=>{
    if(err){
      return next(err);
    }

    req.data = {
      reports: res
    };
    return next();
  });
};

exports.getMyReports = function(req, res, next){
  var member = req.member;
  if(!member.IDCard){
    return next({err: memberError.member_no_IDCard});
  }

  var reportType = req.query.report_type || '';

  reportLogic.getMyReports(member.IDCard, (err, reports)=>{
    if(err){
      return next(err);
    }

    req.data = {
      reports: reports
    };
    return next();
  });
};
exports.getReportDetail = function(req, res, next){

};