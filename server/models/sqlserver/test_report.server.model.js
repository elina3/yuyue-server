'use strict';
var sequelizeLib = require('../../libraries/sequelize');
var Sequelize = require('sequelize');
//门诊：检验报告
var TestReportModel = sequelizeLib.define('View_testReport', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  name: Sequelize.STRING, //报告名称
  category: Sequelize.STRING, //科室
  sampleType: Sequelize.STRING, //样本类型
  clinicalDiagnosis: Sequelize.STRING, //临床诊断
  sickerCardID: Sequelize.STRING, //身份证号
  sourceNumber: Sequelize.STRING, //病源号（门诊/住院号）
  sickerCardNumber: Sequelize.STRING, //病人卡号
  sickerName: Sequelize.STRING, //病人姓名
  sickerType: Sequelize.STRING, //病人类别（门诊/健康/体检/住院）
  sickerSex: Sequelize.STRING, //病人性别
  sickerAge: Sequelize.INTEGER, //病人年龄
  technician: Sequelize.STRING, //技师
  writingReportDoctor: Sequelize.STRING, //书写报告医师
  statistician: Sequelize.STRING, //统计员
  sendingDoctor: Sequelize.STRING, //送检医师
  examinePhysician: Sequelize.STRING, //检验者
  auditedPhysician: Sequelize.STRING, //审核者
  samplingTime: Sequelize.DATE, //采样时间
  receiveTime: Sequelize.DATE, //收到时间
  reportingTime: Sequelize.DATE //报告时间
}, {
  timestamps: false
});
module.exports = TestReportModel;