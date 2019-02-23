/**
* Created by louisha on 15/6/19.
*/
'use strict';
angular.module('YYWeb').controller('UserSignInController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Config', '$window',
    function ($rootScope, $scope, GlobalEvent, $state, UserService, Config, $window) {

      $scope.signInObject = {
        client: '1',
        username: '',
        password: ''
      };
      $scope.signIn = function () {
        if ($scope.signInObject.username === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入用户名');
          return;
        }
        if ($scope.signInObject.password === '') {
          $scope.$emit(GlobalEvent.onShowAlert, '请输入密码');
          return;
        }

        UserService.signIn($scope.signInObject, function(err, user){
          if (err) {
            $scope.$emit(GlobalEvent.onShowAlert, err);
            return;
          }

          $state.go('user_index');
        });
      };
      $scope.goToClientIndex = function(){
        $window.location.href = Config.serverAddress + '/#/client/sign_in';
      };
      $scope.goToClientPersonal = function(){
        $window.location.href = Config.serverAddress + '/#/client/personal_sign_in';
      };
    }]);
