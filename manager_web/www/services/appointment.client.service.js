/**
 * Created by elinaguo on 16/2/26.
 */

'use strict';
angular.module('YYWeb').factory('AppointmentService',
    [
      'Auth', 'RequestSupport', 'SystemError',
      function(Auth, RequestSupport, SystemError) {
        return {
          getList: function(param, callback) {
            RequestSupport.executeGet('/appointment/list', param).
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
            RequestSupport.executeGet('/app/doctor/appointment_detail', param).
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
          pickUpList: function(param, callback){
            RequestSupport.executeGet('/appointment/pick_up_list', param).
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
          pickup: function(param, callback){
            RequestSupport.executePost('/appointment/pick_up', param).
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
          translateAppointmentStatus: function(status) {
            switch (status) {
              case 'booking':
                return '预约中';
              case 'booked':
                return '已预约';
              case 'picked_up':
                return '已取号';
              case 'over_number':
                return '已过号';
              case 'canceled':
                return '已取消';
              default:
                return '未知';
            }
          },
          translateAppointmentPayMethod: function(method) {
            switch (method) {
              case 'wechat':
                return '微信支付';
              case 'offline':
                return '到院支付';
              default:
                return '未知';
            }
          },
        };
      }]);

