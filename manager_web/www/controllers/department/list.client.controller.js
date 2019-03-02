/**
 * Created by elinaguo on 16/3/14.
 */
'use strict';
angular.module('YYWeb').controller('DepartmentListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth, HospitalService) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }

      function loadDepartmentList(callback){
        HospitalService.getDepartments({
          current_page: $scope.pageConfig.pagination.currentPage,
          limit: $scope.pageConfig.pagination.limit
        }, function(err, data){
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.departments = data.departments || [];
          console.log(data.departments);

          $scope.pageConfig.departmentList = data.departments.map(function(item) {
            return {
              _id: item._id,
              name: item.name,
              description: item.description || '--',
              opened: item.opened || false
            };
          });
          // $scope.pageConfig.pagination.totalCount = data.total_count;
          // $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
          return callback();

        });
      }

      $scope.pageConfig = {
        navIndexes: [1, 1],
        departmentList: [],
        pagination: {
          currentPage: 1,
          limit: 20000,
          totalCount: 0,
          isShowTotalInfo: true,
          onCurrentPageChanged: function (callback) {

            $scope.$emit(GlobalEvent.onShowLoading, true);
            loadDepartmentList(function(){
              $scope.$emit(GlobalEvent.onShowLoading, false);
            });
          }
        },
        groupList: []
      };

      function init() {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadDepartmentList(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      }

      init();
    }]);
