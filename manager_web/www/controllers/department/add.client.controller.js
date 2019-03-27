'use strict';
angular.module('YYWeb').controller('DepartmentAddController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService', 'FileUploader', 'Config',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, HospitalService, FileUploader, Config) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        $scope.pageConfig = {
          navIndexes: [1, 1],
          opened: [{ id: true, text: '开放' }, { id: false, text: '关闭' }],
          canOrder: [{ id: true, text: '可预约' }, { id: false, text: '关闭' }],
          canView: [{ id: true, text: '可浏览' }, { id: false, text: '关闭' }],
          department: {
            name: '',
            description: '',
            opened: {id: true, text: '开放'},
            canOrder: {id: true, text: '可预约'},
            canView: {id: true, text: '可浏览'}
          }
        };


        const imageUrl = Config.imageUrl;

        var uploader=$scope.uploader=new FileUploader({
          queueLimit: 1,
          url: Config.uploadUrl,
          removeAfterUpload: true
        });/*实例化一个FileUploader对象*/
        uploader.autoUpload = true;
        uploader.filters.push({
          name: 'imageFilter',
          fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
          }
        });
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          console.log(response);
          console.log(status);
          console.log(headers);
          console.info('onSuccessItem');
          if(response.success){
            $scope.pageConfig.department.title_pic = imageUrl+response.file_id;
            $scope.pageConfig.department.title_pic_key = response.file_id;
          }
        };
        uploader.onErrorItem = function(fileItem, response, status, headers){
          $scope.$emit(GlobalEvent.onShowAlert, '文件上传失败');
        };

        var uploader2=$scope.uploader2=new FileUploader({
          queueLimit: 1,
          url: Config.uploadUrl,
          removeAfterUpload: true
        });/*实例化一个FileUploader对象*/
        uploader2.autoUpload = true;
        uploader2.filters.push({
          name: 'imageFilter',
          fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
          }
        });
        uploader2.onSuccessItem = function(fileItem, response, status, headers) {
          console.log(response);
          console.log(status);
          console.log(headers);
          console.info('onSuccessItem');
          if(response.success){
            $scope.pageConfig.department.desc_pic = imageUrl+response.file_id;
            $scope.pageConfig.department.desc_pic_key = response.file_id;
          }
        };
        uploader2.onErrorItem = function(fileItem, response, status, headers){
          $scope.$emit(GlobalEvent.onShowAlert, '文件上传失败');
        };


        function createDepartment(callback){
          if(!$scope.pageConfig.department.name){
            return $scope.$emit(GlobalEvent.onShowAlert, '请输入科室名称！');
          }
          var params = {
            name: $scope.pageConfig.department.name,
            description: $scope.pageConfig.department.description,
            opened: $scope.pageConfig.department.opened.id,
            can_order: $scope.pageConfig.department.canOrder.id,
            can_view: $scope.pageConfig.department.canView.id,
          };
          console.log('params:', params);

          if($scope.pageConfig.department.desc_pic_key){
            params.desc_pic = $scope.pageConfig.department.desc_pic_key;
          }
          if($scope.pageConfig.department.title_pic_key){
            params.title_pic = $scope.pageConfig.department.title_pic_key;
          }
          HospitalService.createDepartment(params, function(err, data){
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
