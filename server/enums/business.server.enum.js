/**
 * Created by elinaguo on 16/4/24.
 */
'use strict';

exports.terminal_types = {
  enums: ['manager', 'doctor', 'pick_up'],
  valid: function(type){
    return this.enums.indexOf(type) >= 0;
  }
};
exports.user_roles = {
  enums: ['admin', 'doctor', 'picker', 'financial'],//管理员，医生，取号人员，财务人员
  valid: function(role){
    return this.enums.indexOf(role) >= 0;
  }
};

exports.outpatient_types = {
  enums: ['expert', 'normal'],//专家门诊，普通门诊
  valid: function(type){
    return this.enums.indexOf(type) >= 0;
  }
};
