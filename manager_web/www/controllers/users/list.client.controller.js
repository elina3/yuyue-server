'use strict';
angular.module('YYWeb').controller('UserListController',
    ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
      function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }


        function loadUserList(callback){
          $scope.pageConfig.userList = [
            {id: '1', staffNumber: 'staff001', name: '牛二', department: '心内科', jobTitle: '护士', role: '护士'},
            {id: '2', staffNumber: 'staff002', name: '王二小', department: '呼吸内科', jobTitle: '副主任医师', role: '医生'},
            {id: '3', staffNumber: 'staff003', name: '辛加', department: '呼吸内科', jobTitle: '主任医师', role: '医生'},
            {id: '4', staffNumber: 'staff004', name: '张主任', department: '呼吸内科', jobTitle: '信息科主任', role: '管理员'},
            {id: '5', staffNumber: 'staff005', name: '小李', department: '财务', jobTitle: '财务', role: '财务人员'},
          ];

          $scope.pageConfig.pagination.totalCount = 5;
          $scope.pageConfig.pagination.limit = 2;
          $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
          return callback();
        }

        $scope.pageConfig = {
          navIndexes: [1, 0],
          userList: [],
          pagination: {
            currentPage: 1,
            limit: 2,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function (callback) {
              loadUserList(()=>{
                alert('page changed!');
              });
            }
          },
          groupList: []
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
          loadUserList(()=>{
            $scope.pageConfig.pagination.totalCount = 3;
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
