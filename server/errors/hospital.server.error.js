'use strict';

var _ = require('lodash');

module.exports = _.extend(exports, {
  hospital_exists: {type: 'hospital_exists', message: 'The hospital is exists', zh_message: '该医院已存在！'},
  hospital_not_exists: {type: 'hospital_not_exists', message: 'The hospital is not exists', zh_message: '该医院不存在！'},
  department_exists: {type: 'department_exists', message: 'The hospital department is exists', zh_message: '该医院科室已存在！'},
  department_not_exists: {type: 'department_not_exists', message: 'The hospital department is not exists', zh_message: '该医院科室不存在！'},
  job_title_exists: {type: 'job_title_exists', message: 'The hospital job title is exists', zh_message: '该医院职称已存在！'},
  job_title_not_exists: {type: 'job_title_not_exists', message: 'The hospital job title is not exists', zh_message: '该医院职称不存在！'},

  param_name_null: {type: 'param_name_null', message: 'The param of name is null', zh_message: '参数name为空'},



});
