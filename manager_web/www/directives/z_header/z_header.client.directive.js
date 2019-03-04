/**
 * Created by louisha on 15/10/13.
 */

'use strict';

angular.module('YYWeb').directive('zHeader',
    ['Auth', 'GlobalEvent', '$state', 'UserService',
        function (Auth, GlobalEvent, $state, UserService) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/z_header/z_header.client.directive.html',
                replace: true,
                scope: {
                    style: '@'
                },
                link: function (scope, element, attributes) {
                    scope.user = Auth.getUser();

                  if(!scope.user){
                    $state.go('user_sign_in');
                    return;
                  }


                    scope.translateRole = function(role){
                        return UserService.translateUserRole(role);
                    };


                    scope.quit = function () {
                        scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您真的要退出吗？', callback: function (status) {
                            Auth.signOut();
                            $state.go('user_sign_in');
                        }});
                    };

                    scope.changePassword = function(){
                        alert('changePassword');
                    };

                    scope.backHome = function () {
                        if(!scope.user){
                           return $state.go('sign_in');
                        }

                        if(scope.user.role === 'pick_up' || scope.user.role === 'doctor'){
                          return;
                        }

                        $state.go('user_index');
                    };
                }
            };
        }]);
