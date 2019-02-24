/**
* Created by elinaguo on 16/2/26.
*/

'use strict';
angular.module('YYWeb').factory('HospitalService',
  ['Auth', 'RequestSupport', 'SystemError',
    function (Auth, RequestSupport, SystemError) {
      return {
        getDepartments: function(param, callback){
          RequestSupport.executeGet('/hospital/department/list')
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
        createDepartment: function(param, callback){
          RequestSupport.executePost('/hospital/department/create', {
            user_info: param
          })
          .then(function (data) {
                if (!callback) {
                  return data;
                }
                else {
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
        getJobTitles: function(param, callback){
          RequestSupport.executeGet('/hospital/job_title/list')
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
        createJobTitle: function(param, callback){

        }

      };
    }]);

