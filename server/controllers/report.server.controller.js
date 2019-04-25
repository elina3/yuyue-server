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
  if(!member.IDCard && !member.card_number){
    return next({err: memberError.member_no_IDCard});
  }

  var reportType = req.query.report_type || 'test_report';//报告类型：test_report:检验报告，inspect_report:检查报告
  if(['test_report', 'inspect_report'].indexOf(reportType) === -1){
    return next({err: memberError.no_report_type});
  }

  var startDateString = req.query.start_date || '';
  var endDateString = req.query.end_date || '';
  if(!startDateString || !endDateString){
    return next({err: memberError.neither_start_date_nor_end_date});
  }

  var startDate = new Date(startDateString);
  var endDate = new Date(endDateString);
  if(!startDate || !endDate){
    return next({err: memberError.invalid_date});
  }
  startDate = new Date(startDate.Format('yyyy-MM-dd 00:00:00'));
  endDate = new Date(endDate.Format('yyyy-MM-dd 23:59:59'));

  console.log('start:', startDate);
  console.log('end:', endDate);
  if(reportType === 'test_report'){
    reportLogic.getTestReports(member.IDCard, member.card_number, startDate, endDate, (err, list)=>{
      if(err){
        return next(err);
      }
      req.data = {
        reports: list
      };
      return next();
    });
  }
  else if(reportType === 'inspect_report'){
    reportLogic.getInspectReports(member.IDCard, member.card_number, startDate, endDate, (err, list)=>{
      if(err){
        return next(err);
      }
      req.data = {
        reports: list
      };
      return next();
    });
  }
  else{
    req.data = {
      reports: []
    };
    return next();
  }
};

exports.getTestReportDetail = function(req, res, next){
  var reportId = req.query.report_id || '';
  if(!reportId){
    return next({err: memberError.no_report_id});
  }

  var reportType = req.query.report_type || 'test_report';//报告类型：test_report:检验报告，inspect_report:检查报告
  if(['test_report', 'inspect_report'].indexOf(reportType) === -1){
    return next({err: memberError.no_report_type});
  }

  if(reportType === 'test_report'){
    reportLogic.getTestReportDetail(reportId, (err, report) => {
      if(err){
        return next(err);
      }

      req.data = {
        report: report
      };
      return next();
    });
  }else if(reportType === 'inspect_report'){
    reportLogic.getInspectReportDetail(reportId, (err, report) => {
      if(err){
        return next(err);
      }

      req.data = {
        report: report
      };
      return next();
    });
  }else{
    req.data = {
      report: null
    };
    return next();
  }
};