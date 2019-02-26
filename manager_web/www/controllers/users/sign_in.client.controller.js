/**
* Created by louisha on 15/6/19.
*/
'use strict';
angular.module('YYWeb').controller('UserSignInController',
  ['$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Config', '$window',
    function ($rootScope, $scope, GlobalEvent, $state, UserService, Config, $window) {

      $scope.signInObject = {
        terminal_type: 'manager',
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

          switch ($scope.signInObject.terminal_type){
            case 'manager'://管理端登录
              $state.go('user_index');
              break;
            case 'doctor'://医生端登录
              $state.go('schedule_setting', {id: null});
                  break;
            case 'pick_up'://取号端
              $state.go('appointment_pickup');
              break;
          }

        });
      };
      $scope.goToClientIndex = function(){
        $window.location.href = Config.serverAddress + '/#/client/sign_in';
      };
      $scope.goToClientPersonal = function(){
        $window.location.href = Config.serverAddress + '/#/client/personal_sign_in';
      };
    }]);
