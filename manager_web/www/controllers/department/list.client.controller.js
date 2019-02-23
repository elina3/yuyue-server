/**
 * Created by elinaguo on 16/3/14.
 */
'use strict';
angular.module('YYWeb').controller('DepartmentListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }

      function loadDepartmentList(callback){
        $scope.pageConfig.departmentList = [
          {id: '1', name: '信息科', description: '心内科', opened: false},
          {id: '2', name: '呼吸内科', description: '呼吸内科', opened: true},
          {id: '3', name: '内科', description: '呼吸内科', opened: true},
          {id: '4', name: '眼科', description: '呼吸内科', opened: true},
          {id: '5', name: '儿科', description: '财务', opened: true},
        ];

        $scope.pageConfig.pagination.totalCount = 5;
        $scope.pageConfig.pagination.limit = 2;
        $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
        return callback();
      }

      $scope.pageConfig = {
        navIndexes: [1, 1],
        departmentList: [],
        pagination: {
          currentPage: 1,
          limit: 2,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {
            loadDepartmentList(()=>{
              alert('page changed!');
            });
          }
        },
        groupList: []
      };


      function init() {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadDepartmentList(()=>{
          $scope.pageConfig.pagination.totalCount = 3;
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      }

      init();
    }]);
