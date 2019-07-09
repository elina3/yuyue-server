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

                    //todo 目前只考虑后台管理端的功能模块
                    let permission = scope.user.permission.manager;
                    if(permission.length === 0){
                      scope.$emit(GlobalEvent.onShowAlert, '您还没有任何功能模块可以查看，请联系管理员');
                      $state.go('user_sign_in');
                      return;
                    }


                    function getUserNavs(permission){
                      let permissionDic = {};
                      permission.forEach(function(item){
                        if(item.selected){
                          permissionDic[item.text] = true;
                        }
                      });

                      let defaultNavs = [];
                      const baseImageUrl = 'images/directive/aside/';
                      // if(permissionDic['首页']){
                      defaultNavs.push({
                        name: '首页',
                        routeUrl: '#/user/index',
                        defaultIcon: baseImageUrl + 'home.png',
                        currentIcon: baseImageUrl + 'home_current.png'
                      });
                      // }
                      if(permissionDic['首页'] && permission.length > 1){//除了首页还有其他模块
                        let functionModule = {
                          name: '功能',
                          defaultIcon: baseImageUrl + 'function.png',
                          currentIcon: baseImageUrl + 'function_current.png',
                          children: []
                        };

                        if(permissionDic['用户管理']){
                          functionModule.children.push({name: '用户管理',routeUrl: '#/user/list'});
                        }
                        if(permissionDic['科室管理']){
                          functionModule.children.push({name: '科室管理',routeUrl: '#/department/list'});
                        }
                        if(permissionDic['职称管理']){
                          functionModule.children.push({name: '职称管理',routeUrl: '#/job_title/list'});
                        }
                        if(permissionDic['排班管理']){
                          functionModule.children.push({name: '排班管理',routeUrl: '#/schedule/list'});
                        }
                        if(permissionDic['账单管理']){
                          functionModule.children.push({name: '账单管理',routeUrl: '#/pay/list'});
                        }
                        if(permissionDic['就诊卡管理']){
                          functionModule.children.push({name: '就诊卡管理',routeUrl: '#/sicker/list'});
                        }
                        // if(permission['页面管理']){
                        //   functionModule.children.push({name: '页面管理',routeUrl: '#/page/list'});
                        // }

                        defaultNavs.push(functionModule);
                      }
                      return defaultNavs;
                    }

                    scope.navs = getUserNavs(permission);

                    var firstItem = scope.navs[scope.currentIndexes[0]] || scope.navs[0];
                    if(firstItem.children && firstItem.children.length > 0){
                        scope.currentItem = firstItem.children[scope.currentIndexes[1]] || firstItem.children[0];
                    }else{
                       scope.currentItem = firstItem;
                    }

                    scope.currentItem.current = true;

                }
            };
        }]);
