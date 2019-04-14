'use strict';
var sequelizeLib = require('../../libraries/sequelize');
var Sequelize = require('sequelize');
//门诊：检验报告内容
var TestReportItemModel = sequelizeLib.define('View_testReportItems', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true
  },
  reportID: Sequelize.INTEGER, //关联检验报告表id
  sickerCardID: Sequelize.STRING, //病人身份证号
  name: Sequelize.STRING, //检测项目名称
  result: Sequelize.STRING, //检测项目结果
  reference: Sequelize.STRING, //检测项目参考
  conclusion: Sequelize.STRING //检测项目结论
}, {
  timestamps: false, //表中不增加createdAt，updatedAt
  freezeTableName: true //表名不会为复数
});

module.exports = TestReportItemModel;