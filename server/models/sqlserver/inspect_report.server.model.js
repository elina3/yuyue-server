'use strict';
var sequelizeLib = require('../../libraries/sequelize');
var Sequelize = require('sequelize');
//门诊：检查报告
var InspectReportModel = sequelizeLib.define('View_inspectReports', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  name: Sequelize.STRING, //报告名称
  category: Sequelize.STRING, //科室
  inpatientArea: Sequelize.STRING, //病区
  bedNumber: Sequelize.STRING, //床号
  clinicalDiagnosis: Sequelize.STRING, //临床诊断
  outpatient: Sequelize.STRING, //门诊号
  sickerCardID: Sequelize.STRING, //身份证号
  sickerCardNumber: Sequelize.STRING, //病人卡号
  sickerName: Sequelize.STRING, //病人姓名
  sickerType: Sequelize.STRING, //病人类别（门诊/健康/体检/住院）
  sickerSex: Sequelize.STRING, //病人性别
  sickerAge: Sequelize.INTEGER, //病人年龄
  applyingDoctor: Sequelize.STRING, //申请医师
  writingReportDoctor: Sequelize.STRING, //书写报告医师
  sendingDoctor: Sequelize.STRING, //送检医师
  examinePhysician: Sequelize.STRING, //检验者
  auditedPhysician: Sequelize.STRING, //审核者
  examineTime: Sequelize.DATE, //检查时间
  auditedTime: Sequelize.DATE, //审核时间
  reportingTime: Sequelize.DATE, //报告时间
  bodyParts: Sequelize.STRING, //部位
  description: Sequelize.STRING, //描述/所见
  diagnosticsConclusion: Sequelize.STRING //诊断结论
}, {
  timestamps: false, //表中不增加createdAt，updatedAt
  freezeTableName: true //表名不会为复数
});
module.exports = InspectReportModel;