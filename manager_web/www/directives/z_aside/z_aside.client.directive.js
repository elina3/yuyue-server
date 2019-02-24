/**
 * Created by louisha on 15/10/13.
 */

'use strict';

angular.module('YYWeb').directive('zAside',
    ['Auth', 'GlobalEvent', '$state', 'UserService',
        function (Auth, GlobalEvent, $state, UserService) {
            return {
                restrict: 'EA',
                templateUrl: 'directives/z_aside/z_aside.client.directive.html',
                replace: true,
                scope: {
                  currentIndexes: '='
                },

                link: function (scope, element, attributes) {
                  scope.currentIndexes = scope.currentIndexes || [0];
                    scope.user = Auth.getUser();
                    if(!scope.user)
                    {
                        $state.go('user_sign_in');
                        return;
                    }


                  var baseImageUrl = '../../images/directive/aside/';
                    scope.navs = [
                      {
                        name: '首页',
                        routeUrl: '#/user/index',
                        defaultIcon: baseImageUrl + 'home.png',
                        currentIcon: baseImageUrl + 'home_current.png'
                      },
                      {
                        name: '功能',
                        defaultIcon: baseImageUrl + 'function.png',
                        currentIcon: baseImageUrl + 'function_current.png',
                        children: [
                          {name: '用户管理',routeUrl: '#/user/list'},
                          {name: '科室管理',routeUrl: '#/department/list'},
                          {name: '职称管理',routeUrl: '#/job_title/list'},
                          {name: '排班管理',routeUrl: '#/schedule/list'},
                          {name: '账单管理',routeUrl: '#/pay/list'},
                          {name: '就诊卡管理',routeUrl: '#/sicker/list'},
                          // {name: '页面管理',routeUrl: '#/page/list'}
                        ]}
                    ];




                    var firstItem = scope.navs[scope.currentIndexes[0]] || scope.navs[0];
                    if(firstItem.children && firstItem.children.length > 0){
                        scope.currentItem = firstItem.children[scope.currentIndexes[1]] || firstItem.children[0];
                    }else{
                       scope.currentItem = firstItem;
                    }

                    scope.currentItem.current = true;

                    scope.goToView = function (type) {
                        scope.mainMenuOpened = false;
                        switch (type) {
                            case 'user_manager':
                                return $state.go('user_manager');
                            case 'restaurant':
                                return $state.go('goods_manager', {goods_type: 'dish'});
                            case 'supermarket':
                                return $state.go('goods_manager', {goods_type: 'goods'});
                            default :
                                return;
                        }
                    };


                }
            };
        }]);
