'use strict';

angular.module('YYWeb').controller('UserAddController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService', 'FileUploader', 'Config',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, HospitalService, FileUploader, Config) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        let outpatientTypeOptions = [{id: '', text: '无'}, {id: 'expert', text: '专家门诊'}, {id: 'normal', text: '普通门诊'}];
        let roleOptions = [{id: 'admin', text: '后台管理员'}, {id: 'doctor', text: '医生'}, {id: 'pick_up', text: '取号人员'}, {id: 'financial', text: '财务专员'}];
        let terminalTypeOptions = [{id: 'manager', text: '管理端'},{id: 'doctor', text: '医生端'},{id: 'pick_up', text: '取号端'}];

        $scope.pageConfig = {
          navIndexes: [1, 0],
          departments: [],
          jobTitles: [],
          outpatient_types: outpatientTypeOptions,
          roles: roleOptions,
          clients: terminalTypeOptions,
          modulesDic: UserService.getAllPermission(),
          user: {
            selectedClientIds: [],
            password: '654321',
            username: '',
            nickname: '',
            mobile_phone: '',
            IDCard: '',
            role: roleOptions[0],
            outpatientType: outpatientTypeOptions[0],
            jobTitle: null,
            department: null,
            goodAt: '',
            brief: '',
            // headUrl: '../../images/global/default_user.png'
            headUrl: '',
            head_photo_key: ''
          }
        };

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
        // uploader.queue=[];

        uploader.onSuccessItem = function(fileItem, response, status, headers) {
          console.log(response);
          console.log(status);
          console.log(headers);
          console.info('onSuccessItem');
          if(response.success){
            $scope.pageConfig.user.headUrl = Config.imageUrl+response.file_id;
            $scope.pageConfig.user.head_photo_key = response.file_id;
          }
        };
        uploader.onErrorItem = function(fileItem, response, status, headers){
          $scope.$emit(GlobalEvent.onShowAlert, '文件上传失败');
        };


        // $scope.clearItems = function(){    //重新选择文件时，清空队列，达到覆盖文件的效果
        //   uploader.clearQueue();
        // }


        function toggleClientItem(client){
          client.selected = !client.selected;
          var currentSelectedIndex = $scope.pageConfig.user.selectedClientIds.indexOf(client.id);
          if(client.selected){
            if(currentSelectedIndex === -1){
              $scope.pageConfig.user.selectedClientIds.push(client.id);
            }
          }else{
            if(currentSelectedIndex >= 0){
              $scope.pageConfig.user.selectedClientIds.splice(currentSelectedIndex, 1);
            }
          }
        }
        $scope.toggleClient = toggleClientItem;

        $scope.toggleModule = function(moduleKey, moduleItem){
          if(moduleItem.require){
            return;
          }
          moduleItem.selected = !moduleItem.selected;
        };

        function saveOneUser(callback){
          let valid = UserService.userParamsByRole($scope.pageConfig.user.role.id, $scope.pageConfig.user);
          if(valid.err){
            return $scope.$emit(GlobalEvent.onShowAlert, valid.err.zh_message);
          }

          var hasModule = false;
          var permission = {};
          $scope.pageConfig.user.selectedClientIds.forEach(function(item) {
            if($scope.pageConfig.modulesDic[item]){
              var modules = $scope.pageConfig.modulesDic[item].filter(function(a){return a.selected;});
              if(modules.length > 0){
                hasModule = true;
                permission[item] = modules;
              }
            }
          });
          if(!hasModule){
            $scope.$emit(GlobalEvent.onShowAlert, '至少选择一个功能模块');
            return;
          }

          var params = JSON.parse(JSON.stringify($scope.pageConfig.user));

          params.role = params.role.id;
          params.outpatient_type = params.outpatientType && params.outpatientType.id;
          params.terminal_types = params.selectedClientIds;
          params.permission = permission;
          params.head_photo = $scope.pageConfig.user.head_photo_key;
          params.good_at = $scope.pageConfig.user.goodAt;

          $scope.$emit(GlobalEvent.onShowLoading, true);
          UserService.createUser({
            user_info: params,
            department_id: params.department.id,
            job_title_id: params.jobTitle.id
          }, function(err, data){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              $scope.$emit(GlobalEvent.onShowAlert, err);
              return;
            }

            return callback();
          });
        }

        $scope.saveUser = function(){
          saveOneUser(function(){
            $state.go('user_list');
          });
        };

        function loadDepartments(){
          HospitalService.getDepartments({}, function(err, data){
            if(err){
              console.log('加载科室失败',err);
              return;
            }

            if(data.departments){
              $scope.pageConfig.departments = data.departments.map(function(item){
                return {id: item._id, text: item.name};
              });
            }
          });
        }
        function loadJobTitles(){
          HospitalService.getJobTitles({}, function(err, data){
            if(err){
              console.log('加载职称失败',err);
              return;
            }

            if(data.job_titles){
              $scope.pageConfig.jobTitles = data.job_titles.map(function(item){
                return {id: item._id, text: item.name};
              });
            }
          });
        }

        function init() {
          loadDepartments();
          loadJobTitles();
          toggleClientItem($scope.pageConfig.clients[0]);
        }

        init();
      }]);
