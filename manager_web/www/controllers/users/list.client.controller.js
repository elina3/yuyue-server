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

            if(data.users && data.users.length > 0){
              $scope.pageConfig.userList = data.users.map(item => {
                return {
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
            }else{
              return callback();
            }
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
            onCurrentPageChanged: function (callback) {

              $scope.$emit(GlobalEvent.onShowLoading, true);
              loadUserList(()=>{
                $scope.$emit(GlobalEvent.onShowLoading, false);
              });
            }
          },
          groupList: []
        };


        $scope.goBack = function () {
          $window.history.back();
        };


        function init() {

          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadUserList(()=>{
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
