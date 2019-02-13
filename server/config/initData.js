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
                      terminalType: 'management',
                      sex: 'male',
                      mobile_phone: '',
                      head_photo: '',
                      hospitalId: hospital._id,
                      departmentId: department._id,
                      jobTitleId: jobTitle._id
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
