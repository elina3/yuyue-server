'use strict';
var InspectReport = require('../models/sqlserver/inspect_report'),
    TestReport = require('../models/sqlserver/test_report'),
    TestReportItem = require('../models/sqlserver/test_report_item');

var memberError = require('../errors/member'),
  systemError = require('../errors/system');
exports.getReports = function(callback){
  InspectReport.findAll()
      .then((res)=>{
        console.log(res);
        return callback(null, res);
  });
};

//获取检验报告列表
exports.getTestReports = function(cardID, cardNumber, callback){
  if(!cardID && !cardNumber){
    return callback({err: memberError.neither_nor_CardNumber});
  }
  var query = {};
  if(cardID){
    query.sickerCardID = cardID;
  }
  if(cardNumber){
    query.sickerCardNumber = cardNumber;
  }

  TestReport.findAll({
    where: query,
    order: [
      ['reportingTime', 'DESC']
    ],
    attributes: ['name', 'reportingTime', 'id'],
    raw: true //默认raw为false，会生成实例；设置 raw: true 就会直接返回数据，而不会生成实例,只用于查看，不用于删除/更新等
  }).then((list) => {
    console.log(list);
    if(list && Array.isArray(list) && list.length > 0){
      return callback(null, list);
    }else{
      return callback(null, []);
    }
  }).catch((err) => {
    console.error(err);
    return callback({err: systemError.database_query_error});
  });
};
//获取检验报告详情
exports.getTestReportDetail = function(reportId, callback){
  TestReport.findOne({
    where: {
      id: reportId
    }
  }).then((report) => {
    if(!report){
      return callback({err: memberError.report_not_exist});
    }

    TestReportItem.findAll({
      where: {
        reportID: reportId
      },
      attributes: ['name', 'reference', 'result', 'id']
    }).then((items) => {
      if(items && Array.isArray(items) && items.length > 0){
        report.items = items;
      }else{
        report.items = [];
      }

      return callback(null, {baseInfo: report, items: items});
    }).catch( err => {
      console.error(err);
      return callback({err: systemError.database_query_error});
    });
  }).catch( err => {
    console.error(err);
    return callback({err: systemError.database_query_error});
  });
};
//获取检查报告列表
exports.getInspectReports = function(cardID, cardNumber, callback){
  if(!cardID && !cardNumber){
    return callback({err: memberError.neither_nor_CardNumber});
  }
  var query = {};
  if(cardID){
    query.sickerCardID = cardID;
  }
  if(cardNumber){
    query.sickerCardNumber = cardNumber;
  }

  InspectReport.findAll({
    where: query,
    order: [
      ['reportingTime', 'DESC']
    ],
    attributes: ['name', 'reportingTime', 'id'],
    raw: true //默认raw为false，会生成实例；设置 raw: true 就会直接返回数据，而不会生成实例,只用于查看，不用于删除/更新等
  }).then((list) => {
    console.log(list);
    if(list && Array.isArray(list) && list.length > 0){
      return callback(null, list);
    }else{
      return callback(null, []);
    }
  }).catch(err => {
    console.error(err);
    return callback({err: systemError.database_query_error});
  });
};
exports.getInspectReportDetail = function(reportId, callback){
  InspectReport.findOne({
    where: {
      id: reportId
    },
    attributes: ['id', 'sickerName', 'sickerSex', 'sickerAge', 'clinicalDiagnosis', 'category', 'bodyParts', 'reportingTime', 'description', 'diagnosticsConclusion']
  }).then((report) => {
    if(!report){
      return callback({err: memberError.report_not_exist});
    }

    return callback(null, report);
  }).catch(err => {
    console.error(err);
    return callback({err: systemError.database_query_error});
  });
};