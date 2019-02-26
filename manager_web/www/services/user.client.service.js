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
          RequestSupport.executePost('/user/modify', {
              user_info: param
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
              return '未知';

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
        }
      };
    }
  ]);