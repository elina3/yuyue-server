'use strict';
angular.module('YYWeb').controller('UserDetailController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }


        function loadUser(callback){
          UserService.getUserDetail({user_id: $scope.pageConfig.user_id}, function(err, data){
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            console.log(data.user);
            if(data.user){


              var modules = [];
              for(var prop in data.user.permission){
                var module = data.user.permission[prop];
                if(module && module.length > 0){
                  modules.push(module.filter(function(item) {return item.selected;}).map(function(item){return item.text;}));
                }
              }

              $scope.pageConfig.user = {
                username:  data.user.username,
                nickname: data.user.nickname,
                IDCard: data.user.IDCard || '--',
                mobile_phone: data.user.mobile_phone,
                department: data.user.department.name,
                role: UserService.translateUserRole(data.user.role),
                outpatientType:  UserService.translateOutpatientType(data.user.outpatient_type),
                jobTitle: data.user.job_title.name,
                clients: data.user.terminal_types.map(function(item) {
                  return UserService.translateTerminalType(item);
                }),
                modules: modules,//[['用户管理', '科室管理'], ['取号']],
                goodAt: data.user.good_at || '--',
                brief: data.user.brief || '--',
                headUrl: '../../images/global/default_user.png'
              };

              return callback();
            }
          });
        }

        $scope.pageConfig = {
          navIndexes: [1, 0],
          user: {},
        };


        $scope.goBack = function () {
          $window.history.back();
        };


        $scope.goState = function (state) {
          if (!state) {
            return;
          }
          $state.go(state);
        };
        $scope.goToView = function (state) {
          if (!state) {
            return;
          }

          switch (state) {
            case 'user_manager':
              return $state.go('user_manager');
            case 'restaurant':
              $state.go('goods_manager', {goods_type: 'dish'});
              return;
            case 'supermarket':
              if (user.role === 'admin' || user.role === 'supermarket_manager') {
                $state.go('supermarket_order');
              }
              return;
            default:
              return;
          }
        };

        function init() {
          $scope.pageConfig.user_id = $stateParams.id;
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadUser(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
