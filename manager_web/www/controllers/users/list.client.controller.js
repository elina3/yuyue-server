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
          },
          popBox: {
            show: false,
            oldPassword: '',
            newPassword: '',
            newPasswordAgain: '',
            currentUser: null,
            reset: function(){
              this.oldPassword = '';
              this.newPassword = '';
              this.newPasswordAgain = '';
            },
            open: function(userItem){
              console.log(userItem);
              this.currentUser = userItem;
              this.show = true;
            },
            sure: function(){
              if(!this.oldPassword ||  this.oldPassword.length < 6){
                $scope.$emit(GlobalEvent.onShowAlert, '旧密码不符合要求，至少6位字符');
                return;
              }
              if(!this.newPassword ||  this.newPassword.length < 6){
                $scope.$emit(GlobalEvent.onShowAlert, '新密码不符合要求，至少6位字符');
                return;
              }
              if(this.newPassword === this.oldPassword){
                $scope.$emit(GlobalEvent.onShowAlert, '新旧密码相同！');
                return;
              }
              if(this.newPassword !== this.newPasswordAgain){
                $scope.$emit(GlobalEvent.onShowAlert, '新密码两次不一致');
                return;
              }

              $scope.$emit(GlobalEvent.onShowLoading, true);
              UserService.resetPassword({user_id: this.currentUser._id, old_password: this.oldPassword, new_password: this.newPassword}, function(err){
                $scope.$emit(GlobalEvent.onShowLoading, false);
                if(err){
                  return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
                }

                $scope.$emit(GlobalEvent.onShowAlert, '保存成功！');

                $scope.pageConfig.popBox.show = false;
                $scope.pageConfig.popBox.reset();
              });
            },
            cancel: function(){
              this.show = false;
              this.reset();
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

        $scope.resetPassword = function(user){
          $scope.pageConfig.popBox.open(user);
        };

        function init() {
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadUserList(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
