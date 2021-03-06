'use strict';
angular.module('YYWeb').controller('PayListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }


      function loadAppointments(callback){
        $scope.pageConfig.paymentList = [
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
        navIndexes: [1, 4],
        currentDepartment: {id: '', text: '全部科室'},
        departments: [{id: '', text: '全部科室'}, {text: '心脏内科', id: '1'}, {text: '呼吸内科', id: '2'}],
        currentType: {id: '', text: '全部门诊类型'},
        types: [{id: '', text: '全部门诊类型'}, {id: '1', text: '专家门诊'}, {id: '2', text: '普通门诊'}],
        paymentList: [],
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
        }
      };


      function init() {

        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadAppointments(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      }

      init();
    }]);
