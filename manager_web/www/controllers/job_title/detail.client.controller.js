'use strict';
angular.module('YYWeb').controller('JobTitleDetailController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'HospitalService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, HospitalService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }


        function loadJobTitleDetail(callback){
          HospitalService.getJobTitleDetail({job_title_id: $scope.pageConfig.job_title_id}, function(err, data){
            if(err){
              $scope.$emit(GlobalEvent.onShowAlert, err);
            }else{
              $scope.pageConfig.jobTitle = {
                name: data.job_title.name,
                description: data.job_title.description
              };
            }

            return callback();
          });
        }

        $scope.pageConfig = {
          navIndexes: [1, 2],
          jobTitle: {
            name: '',
            description: ''
          },
        };

        function init() {
          $scope.pageConfig.job_title_id = $stateParams.id;
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadJobTitleDetail(()=>{
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
