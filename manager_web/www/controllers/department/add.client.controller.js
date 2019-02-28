'use strict';
angular.module('YYWeb').controller('DepartmentAddController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, HosipitalService) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        $scope.pageConfig = {
          navIndexes: [1, 1],
          department: {
            name: '',
            description: '',
            opened: true
          }
        };

        function createDepartment(callback){
          if(!$scope.pageConfig.department.name){
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入科室名称！');
          }
          var params = {
            name: $scope.pageConfig.department.name,
            description: $scope.pageConfig.department.description,
            opened: $scope.pageConfig.department.opened
          };
          console.log('params:', params);
          HosipitalService.createDepartment(params, function(err, data){
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            $scope.$emit(GlobalEvent.onShowAlert, '保存成功！');
            return callback();
          });
        }

        $scope.saveDepartment = function(){
          $scope.$emit(GlobalEvent.onShowLoading, true);
          createDepartment(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            $state.go('department_list');
          });
        };
      }]);
