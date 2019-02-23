/**
 * Created by elinaguo on 16/3/14.
 */
'use strict';
angular.module('YYWeb').controller('JobTitleListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }

      function loadDepartmentList(callback){
        $scope.pageConfig.jobTitleList = [
          {id: '1', name: '信息科主任', description: '心内科'},
          {id: '2', name: '护士', description: '呼吸内科'},
          {id: '3', name: '副主任医师', description: '呼吸内科'},
          {id: '4', name: '主任医师', description: '呼吸内科'},
          {id: '5', name: '院长', description: '医院院长管理医院所有事务'},
        ];

        $scope.pageConfig.pagination.totalCount = 5;
        $scope.pageConfig.pagination.limit = 2;
        $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
        return callback();
      }

      $scope.pageConfig = {
        navIndexes: [1, 2],
        jobTitleList: [],
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
