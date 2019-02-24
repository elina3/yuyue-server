'use strict';
angular.module('YYWeb').controller('JobTitleAddController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'HospitalService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, HospitalService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        $scope.pageConfig = {
          navIndexes: [1, 2],
          jobTitle: {
            name: '',
            description: ''
          }
        };

        function addJobTitle(callback){
          if(!$scope.pageConfig.jobTitle.name){
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入名称！');
          }
          $scope.$emit(GlobalEvent.onShowLoading, true);
          HospitalService.createJobTitle({
            name: $scope.pageConfig.jobTitle.name,
            description: $scope.pageConfig.jobTitle.description
          }, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            return callback();
          });
        }

        $scope.saveJobTitle = function(){
          addJobTitle(()=>{
            $state.go('job_title_list');
          });
        };
      }]);
