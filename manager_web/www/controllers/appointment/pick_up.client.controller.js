'use strict';
angular.module('YYWeb').controller('AppointmentPickUpController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }


      function loadAppointments(callback){
        $scope.pageConfig.appointmentList = [
          {id: '1', orderNumber: '201893421343', name: '牛二', IDCard: '410825198805177889', cardType: '医保卡', cardNumber: 'yibaoewr3809582035'},
          {id: '2', orderNumber: '201893421344', name: '王二小', IDCard: '28082519880517788X', cardType: '--', cardNumber: '--'},
          {id: '3', orderNumber: '201893421345', name: '辛加', IDCard: '320825198805177833', cardType: '就诊卡', cardNumber: 'etfewr3809582035'}
        ];

        $scope.pageConfig.pagination.totalCount = 3;
        $scope.pageConfig.pagination.limit = 2;
        $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
        return callback();
      }

      $scope.pageConfig = {
        navIndexes: [0],
        currentDepartment: {id: '', text: '全部科室'},
        departments: [{id: '', text: '全部科室'}, {text: '心脏内科', id: '1'}, {text: '呼吸内科', id: '2'}],
        currentType: {id: '', text: '全部门诊类型'},
        types: [{id: '', text: '全部门诊类型'}, {id: '1', text: '专家门诊'}, {id: '2', text: '普通门诊'}],
        appointmentList: [],
        pagination: {
          currentPage: 1,
          limit: 2,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            loadAppointments(function(){
              alert('page changed!');
            });
          }
        },
        groupList: []
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
        console.log(photobase);
        // myElement10.src="data:image/jpeg;base64,"+photobase;
      };

      function init() {

        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadAppointments(function(){
          $scope.pageConfig.pagination.totalCount = 3;
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      }

      init();
    }]);
