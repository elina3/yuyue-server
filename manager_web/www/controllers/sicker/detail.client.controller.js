'use strict';
angular.module('YYWeb').controller('SickerDetailController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth) {
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
            type: '专家门诊',
            doctor: '刘医生',
            appointmentTimeRange: '2019/01/30 08:00～9:00',
            price: '30元',
            payStatus: '到店付款',// 到店付款 /微信已支付 /微信已退款 /微信未支付
            payTime: '--',
            status: '已预约'//已取号2 //已取消3 //已预约1 //支付中0
          };
          return callback();
        }

        $scope.pageConfig = {
          navIndexes: [1, 5],
          appointment: {id: '1', orderNumber: '201893421343', name: '牛二', IDCard: '410825198805177889', cardType: '医保卡', cardNumber: 'yibaoewr3809582035'},
        };


        $scope.goBack = function () {
          $window.history.back();
        };


        $scope.goState = function (state) {
          if (!state) {
            return;
          }
          $state.go(state);
        };
        $scope.goToView = function (state) {
          if (!state) {
            return;
          }

          switch (state) {
            case 'user_manager':
              return $state.go('user_manager');
            case 'restaurant':
              $state.go('goods_manager', {goods_type: 'dish'});
              return;
            case 'supermarket':
              if (user.role === 'admin' || user.role === 'supermarket_manager') {
                $state.go('supermarket_order');
              }
              return;
            default:
              return;
          }
        };

        function init() {
          console.log('params.id:', $stateParams.id);


          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadAppointment(()=>{
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
