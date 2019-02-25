/**
 * Created by elinaguo on 16/2/29.
 */
'use strict';

var hospitalLogic = require('../logics/hospital'),
    departmentLogic = require('../logics/department'),
    jobTitleLogic = require('../logics/job_title'),
  userLogic = require('../logics/user');

exports.createDefaultHospital = function() {
  hospitalLogic.createHospital({ name: '瑞金医院古北分院', address: '上海市长宁区红宝石路398号' },
      function(err, hospital) {
        if (err) {
          console.log(err.err.zh_message, '医院：瑞金医院古北分院');
        } else {
          console.log('init hospital successfully:医院：瑞金医院古北分院');
        }

        if(!hospital){
          return;
        }

        departmentLogic.createDepartment(
            { hospitalId: hospital._id, name: '其他' },
            function(err, department) {
              if (err) {
                console.log(err.err.zh_message, '科室：其他');
              } else {
                console.log('init department successfully:科室：其他');
              }

              if(!department){
                return;
              }
              jobTitleLogic.createJobTitle(
                  { hospitalId: hospital._id, name: '其他' },
                  function(err, jobTitle) {
                    if (err) {
                      console.log(err.err.zh_message, '职称：其他');
                    } else {
                      console.log('init job title successfully:职称：其他');
                    }

                    if(!jobTitle){
                      return;
                    }
                    userLogic.createUser({
                      username: 'admin',
                      nickname: '系统管理员',
                      password: '654321',
                      role: 'admin',
                      terminal_types: ['manager', 'doctor', 'pick_up'],
                      sex: 'male',
                      mobile_phone: '18399990000',
                      head_photo: '',
                      hospitalId: hospital._id,
                      departmentId: department._id,
                      jobTitleId: jobTitle._id,
                      
                      permission: {
                        'manager': [
                          {id: '1a', text: '首页', selected: true},
                          {id: '1b', text: '用户管理', selected: true},
                          {id: '1c', text: '科室管理', selected: true},
                          {id: '1d', text: '职称管理', selected: true},
                          {id: '1e', text: '账单管理', selected: true},
                          {id: '1f', text: '就诊卡管理', selected: true},
                          {id: '1g', text: '页面管理', selected: true},
                        ],
                        'doctor': [{id: '2a', text: '排班管理', selected: true}],
                        'pick_up': [{id: '3a', text: '取号打印', selected: true}] 
                      }
                    }, function(err, admin){
                      if(err){
                        console.log(err.err.zh_message, '用户：系统管理员');
                      }else{
                        console.log('init user successfully:用户：系统管理员');
                      }

                    });
                  });
            });
      });
};
