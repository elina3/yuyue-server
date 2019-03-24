'use strict';
angular.module('YYWeb').controller('AppointmentPrintController',
  ['$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'AppointmentService', 'MemberService',
    function ($rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, AppointmentService, MemberService) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }


      function loadAppointment(callback){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        AppointmentService.getDetail({appointment_id: $scope.pageConfig.appointmentId}, function(err, data){
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
          }

          let appointment = data.appointment;
          if(appointment){
            console.log(appointment);
            $scope.pageConfig.appointment = {
              id: appointment._id,
              orderNumber: appointment.order_number,
              name: appointment.nickname,
              IDCard: appointment.IDCard,
              cardType: MemberService.translateCardType(appointment.card_type) || '无',
              cardNumber: appointment.card_number || '无',
              mobile: appointment.member.mobile_phone || '无',
              department: appointment.department.name,
              outpatientType: UserService.translateOutpatientType(appointment.doctor.outpatient_type),
              doctor: appointment.doctor.nickname,
              startTime: new Date(appointment.start_time).Format('hh:mm'),
              endTime: new Date(appointment.end_time).Format('hh:mm'),
              date: new Date(appointment.start_time).Format('yyyy/MM/dd'),
              price: appointment.price > 0 ? parseInt(appointment.price / 100) + '元' : '未设置',
              payStatus: AppointmentService.translateAppointmentPayMethod(appointment.pay_method),
              payTime: appointment.paid_time ? new Date(appointment.paid_time).Format('yyyy-MM-dd hh:mm') : '--',
              status: AppointmentService.translateAppointmentStatus(appointment.status),
              printTime: new Date().Format('yyyy/MM/dd hh:mm'),
              printer: user.nickname
            };
          }
          return callback();
        });
      }

      // function loadAppointment(callback){
      //   $scope.pageConfig.appointment = {
      //     id: '3',
      //     orderNumber: '201893421345',
      //     name: '辛加',
      //     IDCard: '320825198805177833',
      //     cardType: '医保卡',//医保卡，诊疗卡，无
      //     cardNumber: 'etfewr3809582035',
      //     mobile: '18321119877',
      //     department: '心外科',
      //     outpatientType: '专家门诊',
      //     doctor: '刘医生',
      //     startTime: '08:00',
      //     endTime: '09:00',
      //     date: '2019/01/30',
      //     price: '30元',
      //     payStatus: '到店付款',// 到店付款 /微信已支付 /微信已退款 /微信未支付
      //     payTime: '--',
      //     status: '已预约',//已取号2 //已取消3 //已预约1 //支付中0
      //     printTime: new Date().Format('yyyy/MM/dd hh:mm'),
      //     printer: '张红'
      //   };
      //
      //   return callback();
      // }

      $scope.pageConfig = {
        appointment: {}
      };

      function init() {
        $scope.pageConfig.appointmentId = $stateParams.id;

        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadAppointment(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);

          JsBarcode('#barcode', $scope.pageConfig.appointment.orderNumber);

          setTimeout(function(){
            window.print();
          }, 1000);
        });
      }

      init();
    }]);
