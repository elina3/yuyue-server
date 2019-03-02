/**
 * Created by elinaguo on 16/2/26.
 */

'use strict';
angular.module('YYWeb').factory('UserService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getDepartments: function (param, callback) {
          RequestSupport.executeGet('/department/list', {
              current_page: param.currentPage,
              limit: param.limit,
              skip_count: param.skipCount
            })
            .then(function (data) {
                if (!callback) {
                  return data;
                }

                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        createUser: function (param, callback) {
          RequestSupport.executePost('/user/create', param)
            .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        modifyUser: function (param, callback) {
          RequestSupport.executePost('/user/modify',param)
            .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        deleteUser: function (userId, callback) {
          RequestSupport.executePost('/user/delete', {
              user_id: userId
            })
            .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        signIn: function (param, callback) {
          RequestSupport.executePost('/user/sign_in', param)
            .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }
                  Auth.setUser(data.user);
                  Auth.setToken(data.access_token);
                  return callback(null, data.user);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        resetPassword: function (param, callback) {
          RequestSupport.executePost('/user/reset_password', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }
                  Auth.setUser(data.user);
                  Auth.setToken(data.access_token);
                  return callback(null, data.user);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        translateUserRole: function (role) {
          switch (role) {
            case 'admin':
              return '管理员';
            case 'pick_up':
              return '取号人员';
            case 'doctor':
              return '医生';
            case 'financial':
              return '财务专员';
            default:
              return '未知';

          }
        },
        translateTerminalType: function (type) {
          switch (type) {
            case 'manager':
              return '管理端';
            case 'pick_up':
              return '取号端';
            case 'doctor':
              return '医生端';
            default:
              return '未知';

          }
        },
        translateOutpatientType: function (type) {
          switch (type) {
            case 'expert':
              return '专家门诊';
            case 'normal':
              return '普通门诊';
            default:
              return '无';

          }
        },
        isPhoneAvailable: function(phone) {
          let regex = /^[1][3,4,5,7,8][0-9]{9}$/;
          if (!regex.test(phone)) {
            return false;
          } else {
            return true;
          }
        },
        isCardNo: function(card)
        {
          // 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
          var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
          return reg.test(card);
        },
        userParamsByRole: function(role, userInfo){

          if(!userInfo.username){
            return {err: {zh_message: '员工号必填'}};
          }
          if(!userInfo.nickname){
            return {err: {zh_message: '姓名必填'}};
          }
          if(!userInfo.mobile_phone){
            return {err: {zh_message: '手机号必填'}};
          }
          if(!this.isPhoneAvailable(userInfo.mobile_phone)){
            return {err: {zh_message: '手机号无效'}};
          }
          if(!userInfo.department){
            return {err: {zh_message: '科室必填'}};
          }
          if(!userInfo.jobTitle){
            return {err: {zh_message: '职称必填'}};
          }
          if(!userInfo.role){
            return {err: {zh_message: '角色必填'}};
          }
          if(!userInfo.selectedClientIds){
            return {err: {zh_message:'至少选择一端登录'}};
          }
          if(userInfo.IDCard && !this.isCardNo(userInfo.IDCard)){
            return {err: {zh_message:'身份证号码格式不正确！'}};
          }


          switch (role){
            case 'doctor':
              if(!userInfo.brief){
                return {err: {zh_message:'医生必须要填简介'}};
              }
              if(!userInfo.goodAt){
                return {err: {zh_message:'医生必须要填擅长'}};
              }
              if(!userInfo.outpatientType || !userInfo.outpatientType.id){
                return {err: {zh_message:'医生必须要选择一个门诊类型'}};
              }
              return {};
            default:
              return {};
          }

        },
        getAllPermission: function () {
          return {
            'manager': [{
                id: '1a',
                text: '首页',
                selected: true,
                require: true
              },
              {
                id: '1b',
                text: '用户管理',
                selected: true
              },
              {
                id: '1c',
                text: '科室管理',
                selected: true
              },
              {
                id: '1d',
                text: '职称管理',
                selected: true
              },
              {
                id: '1h',
                text: '排班管理',
                selected: true
              },
              {
                id: '1e',
                text: '账单管理',
                selected: true
              },
              {
                id: '1f',
                text: '就诊卡管理',
                selected: true
              },
              {
                id: '1g',
                text: '页面管理',
                selected: true
              },
            ],
            'doctor': [{
              id: '2a',
              text: '排班管理',
              selected: true,
              require: true
            }],
            'pick_up': [{
              id: '3a',
              text: '取号打印',
              selected: true,
              require: true
            }]
          };
        },
        getUsers: function (param, callback) {
          RequestSupport.executeGet('/user/list', param)
            .then(function (data) {
                if (!callback) {
                  return data;
                }

                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        getUserDetail: function (param, callback) {
          RequestSupport.executeGet('/user/detail', param)
            .then(function (data) {
                if (!callback) {
                  return data;
                }

                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        getAllDoctors: function(param, callback){
          RequestSupport.executeGet('/user/doctor/list', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                }

                if (data.err) {
                  return callback(data.zh_message || data.err);
                }

                callback(null, data);
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        onShelfDoctor: function(param, callback){
          RequestSupport.executePost('/user/doctor/on_shelf', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        offShelfDoctor: function(param, callback){
          RequestSupport.executePost('/user/doctor/off_shelf', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        setDoctorPrice: function(param, callback){
          RequestSupport.executePost('/user/doctor/set_price', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        addDoctorSchedule: function(param, callback){
          RequestSupport.executePost('/user/doctor/add_schedule', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        modifyDoctorSchedule: function(param, callback){
          RequestSupport.executePost('/user/doctor/modify_schedule', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        },
        getDoctorSchedules: function(param, callback){
          RequestSupport.executeGet('/user/doctor/schedule_list', param)
          .then(function (data) {
                if (!callback) {
                  return data;
                } else {
                  if (data.err) {
                    return callback(data.zh_message || data.err);
                  }

                  callback(null, data);
                }
              },
              function (err) {
                return callback(SystemError.network_error);
              });
        }
      };
    }
  ]);