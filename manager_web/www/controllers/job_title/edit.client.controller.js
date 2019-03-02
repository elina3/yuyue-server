'use strict';
angular.module('YYWeb').controller('JobTitleEditController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'HospitalService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, HospitalService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        $scope.pageConfig = {
          navIndexes: [1, 2],
          job_title_id: '',
          jobTitle: {
            name: '',
            description: ''
          }
        };

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

        function saveJobTitle(callback){
          if(!$scope.pageConfig.jobTitle.name){
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入名称！');
          }
          $scope.$emit(GlobalEvent.onShowLoading, true);
          HospitalService.editJobTitle({
            job_title_id: $scope.pageConfig.job_title_id,
            name: $scope.pageConfig.jobTitle.name,
            description: $scope.pageConfig.jobTitle.description
          }, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            $scope.$emit(GlobalEvent.onShowAlert, '保存成功！');

            return callback();
          });
        }

        $scope.saveJobTitle = function(){
          saveJobTitle(function(){
            $state.go('job_title_list');
          });
        };

        function init() {
          $scope.pageConfig.job_title_id = $stateParams.id;
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadJobTitleDetail(function(){
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
