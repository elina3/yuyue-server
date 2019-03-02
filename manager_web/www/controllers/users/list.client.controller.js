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
          UserService.getUsers({
            search_key: $scope.pageConfig.searchKey,
            current_page: $scope.pageConfig.pagination.currentPage,
            limit: $scope.pageConfig.pagination.limit
          }, function(err, data){
            if(err){
              $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            data.users = data.users || [];
            $scope.pageConfig.userList = data.users.map(function(item) {
              return {
                _id: item._id,
                username: item.username,
                nickname: item.nickname,
                department: item.department.name,
                jobTitle: item.job_title.name,
                role: UserService.translateUserRole(item.role)
              };
            });


            $scope.pageConfig.pagination.totalCount = data.total_count;
            $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
            return callback();
          });
        }

        $scope.pageConfig = {
          navIndexes: [1, 0],
          userList: [],
          searchKey: '',
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function () {
              $scope.$emit(GlobalEvent.onShowLoading, true);
              loadUserList(function(){
                $scope.$emit(GlobalEvent.onShowLoading, false);
              });
            }
          }
        };

        $scope.search = function () {
          $scope.pageConfig.pagination.currentPage = 1;
          $scope.pageConfig.pagination.totalCount = 0;
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadUserList(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        };

        function init() {
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadUserList(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
