'use strict';
angular.module('YYWeb').controller('DepartmentDetailController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'HospitalService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, HospitalService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }


        function loadDepartment(callback){
          HospitalService.getDepartmentDetail({department_id: $scope.pageConfig.department_id}, function(err, data){
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            data.department = data.department || {};

            $scope.pageConfig.department = {
              name: data.department.name,
              description: data.department.description || '--',
              headUrl: '../../images/global/default_user.png'
            };
            return callback();
          });
        }

        $scope.pageConfig = {
          navIndexes: [1, 1],
          department_id: '',
          department: {},
        };

        function init() {
          $scope.pageConfig.department_id = $stateParams.id;
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadDepartment(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
