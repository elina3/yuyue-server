'use strict';
angular.module('YYWeb').controller('AppointmentPrintController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }


      function loadAppointment(callback){
        $scope.pageConfig.appointment = {
          id: '3',
          orderNumber: '201893421345',
          name: '辛加',
          IDCard: '320825198805177833',
          cardType: '医保卡',//医保卡，诊疗卡，无
          cardNumber: 'etfewr3809582035',
          mobile: '18321119877',
          department: '心外科',
          outpatientType: '专家门诊',
          doctor: '刘医生',
          startTime: '08:00',
          endTime: '09:00',
          date: '2019/01/30',
          price: '30元',
          payStatus: '到店付款',// 到店付款 /微信已支付 /微信已退款 /微信未支付
          payTime: '--',
          status: '已预约',//已取号2 //已取消3 //已预约1 //支付中0
          printTime: new Date().Format('yyyy/MM/dd hh:mm'),
          printer: '张红'
        };

        return callback();
      }

      $scope.pageConfig = {
        appointment: {}
      };

      function init() {

        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadAppointment(()=>{
          $scope.$emit(GlobalEvent.onShowLoading, false);

          window.print();
        });
      }

      init();
    }]);
