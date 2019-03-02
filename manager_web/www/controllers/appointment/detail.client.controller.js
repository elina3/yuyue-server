'use strict';
angular.module('YYWeb').controller('AppointmentDetailController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'AppointmentService',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, AppointmentService) {
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
                cardType: appointment.card_type || '--',
                cardNumber: appointment.card_number || '--',
                mobile: appointment.member.mobile_phone || '--',
                department: appointment.department.name,
                type: UserService.translateOutpatientType(appointment.outpatient_type),
                doctor: appointment.doctor.nickname,
                appointmentTimeRange: new Date(appointment.start_time).Format('yyyy-MM-dd hh:mm') + '~' + new Date(appointment.end_time).Format('hh:mm'),
                price: appointment.price > 0 ? parseInt(appointment.price / 100) + '元' : '未设置',
                payStatus: AppointmentService.translateAppointmentPayMethod(appointment.pay_method),
                payTime: appointment.paid_time ? new Date(appointment.paid_time).Format('yyyy-MM-dd hh:mm') : '--',
                status: AppointmentService.translateAppointmentStatus(appointment.status)
              };
            }
            return callback();
          });
          // $scope.pageConfig.appointment = {
          //   id: '3',
          //   orderNumber: '201893421345',
          //   name: '辛加',
          //   IDCard: '320825198805177833',
          //   cardType: '医保卡',//医保卡，诊疗卡，无
          //   cardNumber: 'etfewr3809582035',
          //   mobile: '18321119877',
          //   department: '心外科',
          //   type: '专家门诊',
          //   doctor: '刘医生',
          //   appointmentTimeRange: '2019/01/30 08:00～9:00',
          //   price: '30元',
          //   payStatus: '到店付款',// 到店付款 /微信已支付 /微信已退款 /微信未支付
          //   payTime: '--',
          //   status: '已预约'//已取号2 //已取消3 //已预约1 //支付中0
          // };
          // return callback();
        }

        $scope.pageConfig = {
          navIndexes: [0],
          appointmentId: '',
          appointment: {id: '1', orderNumber: '201893421343', name: '牛二', IDCard: '410825198805177889', cardType: '医保卡', cardNumber: 'yibaoewr3809582035'},
        };


        function init() {
          console.log('params.id:', $stateParams.id);

          $scope.pageConfig.appointmentId = $stateParams.id;

          loadAppointment(function(){});
        }

        init();
      }]);
