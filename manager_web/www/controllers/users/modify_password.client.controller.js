'use strict';
angular.module('YYWeb').controller('ModifyPasswordController',
    ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth',
      function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        $scope.pageConfig = {
          oldPassword: '',
          newPassword: '',
          newPasswordAgain: '',
        };

        $scope.resetPassword = function(){
          if(!$scope.pageConfig.oldPassword ||  $scope.pageConfig.oldPassword.length < 6){
            $scope.$emit(GlobalEvent.onShowAlert, '旧密码不符合要求，至少6位字符');
            return;
          }
          if(!$scope.pageConfig.newPassword ||  $scope.pageConfig.newPassword.length < 6){
            $scope.$emit(GlobalEvent.onShowAlert, '新密码不符合要求，至少6位字符');
            return;
          }
          if($scope.pageConfig.newPassword === $scope.pageConfig.oldPassword){
            $scope.$emit(GlobalEvent.onShowAlert, '新旧密码相同！');
            return;
          }
          if($scope.pageConfig.newPassword !== $scope.pageConfig.newPasswordAgain){
            $scope.$emit(GlobalEvent.onShowAlert, '新密码两次不一致');
            return;
          }

          $scope.$emit(GlobalEvent.onShowLoading, true);
          UserService.resetPassword({user_id: user._id, old_password: $scope.pageConfig.oldPassword, new_password: $scope.pageConfig.newPassword}, function(err){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
            }

            $scope.$emit(GlobalEvent.onShowAlert, '保存成功！');
            $scope.pageConfig.oldPassword = '';
            $scope.pageConfig.newPassword = '';
            $scope.pageConfig.newPasswordAgain = '';
          });
        };

        $scope.goBack = function () {
          $window.history.back();
        };
      }]);
