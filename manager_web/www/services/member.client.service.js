/**
 * Created by elinaguo on 16/2/26.
 */

'use strict';
angular.module('YYWeb').factory('MemberService',
    [
      'Auth', 'RequestSupport', 'SystemError',
      function(Auth, RequestSupport, SystemError) {
        return {
          getList: function(param, callback) {
            RequestSupport.executeGet('/member/list', param).
                then(function(data) {
                      if (!callback) {
                        return data;
                      }

                      if (data.err) {
                        return callback(data.zh_message || data.err);
                      }

                      callback(null, data);
                    },
                    function(err) {
                      return callback(SystemError.network_error);
                    });
          },
          getDetail: function(param, callback) {
            RequestSupport.executeGet('/member/detail', param).
                then(function(data) {
                      if (!callback) {
                        return data;
                      }

                      if (data.err) {
                        return callback(data.zh_message || data.err);
                      }

                      callback(null, data);
                    },
                    function(err) {
                      return callback(SystemError.network_error);
                    });
          },
          translateCardType: function(type) {
            switch (type) {
              case 'health_care':
                return '医保卡';
              case 'medical':
                return '诊疗卡';
              case 'none':
                return '无';
              default:
                return '无';
            }
          }
        };
      }]);

