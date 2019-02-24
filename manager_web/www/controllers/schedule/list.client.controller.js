'use strict';
angular.module('YYWeb').controller('ScheduleListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }


      function loadDoctors(callback){
        $scope.pageConfig.doctorList = [
          {id: '1', department: '儿科', name: '牛二', outpatientType: '专科门诊', price: 20, statusString: '未上架', status: 'offShelf'},
          {id: '2', department: '心脏内科', name: '王二小', outpatientType: '专科门诊', price: 30, statusString: '已上架', status: 'onShelf'},
          {id: '3', department: '呼吸内科', name: '辛加', outpatientType: '普通门诊', price: 100, statusString: '已上架', status: 'onShelf'}
        ];

        $scope.pageConfig.pagination.totalCount = 3;
        $scope.pageConfig.pagination.limit = 2;
        $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
        return callback();
      }

      $scope.pageConfig = {
        navIndexes: [1, 3],
        currentDepartment: {id: '', text: '全部科室'},
        departments: [{id: '', text: '全部科室'}, {text: '心脏内科', id: '1'}, {text: '呼吸内科', id: '2'}],
        currentType: {id: '', text: '全部门诊类型'},
        types: [{id: '', text: '全部门诊类型'}, {id: '1', text: '专家门诊'}, {id: '2', text: '普通门诊'}],
        doctorList: [],
        pagination: {
          currentPage: 1,
          limit: 2,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            loadDoctors(()=>{
              alert('page changed!');
            });
          }
        },
        popBox: {
          show: false,
          inputNumber: 0,
          currentDoctor: null,
          open: function(doctor){
            this.inputNumber = doctor.price;
            this.currentDoctor = doctor;
            this.show = true;
          },
          sure: function(){
            this.currentDoctor.price = this.inputNumber;
            this.inputNumber = 0;
            this.show = false;
          },
          cancel: function(){
            this.currentDoctor = null;
            this.inputNumber = 0;
            this.show = false;
          }
        }
      };

      $scope.settingPrice = function(doctor){
        $scope.pageConfig.popBox.open(doctor);
      };

      $scope.upperShelf = function(doctor){
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您确定要上架吗？', callback: function (status) {
          alert('success!');
        }});
      };

      $scope.lowerShelf = function(doctor){
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您确定要下架吗？', callback: function (status) {
          alert('success!');
        }});
      };
      

      $scope.settingSchedule = function(doctor){
        var url = $state.href('schedule_setting',{id: doctor.id});
        window.open(url,'_blank');
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

        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadDoctors(()=>{
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      }

      init();
    }]);
