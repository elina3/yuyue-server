'use strict';
angular.module('YYWeb').controller('AppointmentPickUpController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth', 'AppointmentService', 'MemberService',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth, AppointmentService, MemberService) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }


      function loadAppointments(callback) {

        $scope.$emit(GlobalEvent.onShowLoading, true);
        AppointmentService.pickUpList({
          IDCard: $scope.pageConfig.IDCard,
          order_number: $scope.pageConfig.orderNumber
        }, function(err, data) {
          $scope.$emit(GlobalEvent.onShowLoading, false);
          if (err) {
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.appointments = data.appointments || [];
          $scope.pageConfig.appointmentList = data.appointments.map(
              function(item) {
                return {
                  id: item._id,
                  orderNumber: item.order_number,
                  name: item.nickname,
                  IDCard: item.IDCard,
                  cardType: MemberService.translateCardType(item.card_type) || '无',
                  cardNumber: item.card_number || '无',
                  role: UserService.translateUserRole(item.role),
                  doctor: item.doctor.nickname,
                  department: item.department.name,
                  outpatient_type: UserService.translateOutpatientType(item.doctor.outpatient_type),
                  payMethodString: AppointmentService.translateAppointmentPayMethod(item.pay_method),
                  payMethod: item.pay_method,
                  timeRange: new Date(item.start_time).Format('yyyy/MM/dd hh:mm') + '~' + new Date(item.end_time).Format('hh:mm'),
                  paid: item.paid,
                  status: item.status,
                  mobile: item.member.mobile,
                  statusString: AppointmentService.translateAppointmentStatus(item.status)
                };
              });

          return callback();
        });
      }

      // function loadAppointments(callback){
      //   $scope.pageConfig.appointmentList = [
      //     {id: '1', orderNumber: '201893421343', name: '牛二', IDCard: '410825198805177889', cardType: '医保卡', cardNumber: 'yibaoewr3809582035'},
      //     {id: '2', orderNumber: '201893421344', name: '王二小', IDCard: '28082519880517788X', cardType: '--', cardNumber: '--'},
      //     {id: '3', orderNumber: '201893421345', name: '辛加', IDCard: '320825198805177833', cardType: '就诊卡', cardNumber: 'etfewr3809582035'}
      //   ];
      //
      //   $scope.pageConfig.pagination.totalCount = 3;
      //   $scope.pageConfig.pagination.limit = 2;
      //   $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
      //   return callback();
      // }

      $scope.pageConfig = {
        navIndexes: [0],
        IDCard: '',
        orderNumber: '',
        appointmentList: [],
      };

      $scope.goPrint = function(){
        var url = $state.href('appointment_print',{id: 3});
        window.open(url,'_blank');
      };

      function plugin0()
      {
        return document.getElementById('plugin0');
      }
      var plugin = plugin0;

      $scope.readIDCard = function(){
        if(!plugin || !plugin().SetReadType){
          console.log('no plugin');
          return;
        }
        plugin().SetReadType(0);
        plugin().SetPortNo(1001);
        plugin().ReadCard();
        console.log(plugin());

        var namea1 = plugin().Name + '/' + plugin().NameL;
        console.log(namea1);

        var sex1 = plugin().Sex + '/' + plugin().SexL;
        console.log(sex1);

        var nation1 = plugin().Nation + '/' + plugin().NationL;
        console.log(nation1);

        var born1 = plugin().Born + '/' + plugin().BornL;
        console.log(born1);

        var address1 = plugin().Address;
        console.log(address1);

        var cardno1 = plugin().CardNo;
        console.log(cardno1);
        $scope.IDNumber = cardno1;

        var police1 = plugin().Police;
        console.log(police1);

        var ustart1 = plugin().UserLifeB;
        console.log(ustart1);

        var uend1 = plugin().UserLifeE;
        console.log(uend1);

        var photoname1 = plugin().PhotoName;
        console.log(photoname1);

        var photobase = plugin().Base64Photo;
        if(photobase){
          $scope.IDImage = 'data:image/jpeg;base64,' + photobase;
        }
        //console.log(photobase);
        // myElement10.src="data:image/jpeg;base64,"+photobase;
      };

      $scope.search = function() {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadAppointments(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      };
    }]);
