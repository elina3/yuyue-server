'use strict';
angular.module('YYWeb').controller('UserAddController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, HospitalService) {
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
            headUrl: '../../images/global/default_user.png'
          }
        };


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
          moduleItem.selected = !moduleItem.selected;
        };

        function saveOneUser(callback){
          if(!$scope.pageConfig.user.username){
            $scope.$emit(GlobalEvent.onShowAlert, '员工号必填');
            return;
          }
          if(!$scope.pageConfig.user.nickname){
            $scope.$emit(GlobalEvent.onShowAlert, '姓名必填');
            return;
          }
          if(!$scope.pageConfig.user.mobile_phone){
            $scope.$emit(GlobalEvent.onShowAlert, '手机号必填');
            return;
          }
          if(!$scope.pageConfig.user.department){
            $scope.$emit(GlobalEvent.onShowAlert, '科室必填');
            return;
          }
          if(!$scope.pageConfig.user.jobTitle){
            $scope.$emit(GlobalEvent.onShowAlert, '职称必填');
            return;
          }
          if(!$scope.pageConfig.user.role){
            $scope.$emit(GlobalEvent.onShowAlert, '角色必填');
            return;
          }
          if(!$scope.pageConfig.user.selectedClientIds){
            $scope.$emit(GlobalEvent.onShowAlert, '至少选择一端登录');
            return;
          }

          var hasModule = false;
          var permission = {};
          $scope.pageConfig.user.selectedClientIds.forEach(item => {
            if($scope.pageConfig.modulesDic[item]){
              var modules = $scope.pageConfig.modulesDic[item].filter(a=>{return a.selected;});
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

          if($scope.pageConfig.user._id){
            //todo updateUser
            console.log('updateUser');
            return callback();
          }else{
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

              console.log(err);
              console.log(data);

              return callback();
            });
          }
        }

        $scope.saveUser = function(){
          saveOneUser(()=>{
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
              $scope.pageConfig.departments = data.departments.map(item=>{
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
              $scope.pageConfig.jobTitles = data.job_titles.map(item=>{
                return {id: item._id, text: item.name};
              });
            }
          });
        }

        function init() {
          console.log('params.id:', $stateParams.id);

          loadDepartments();
          loadJobTitles();


          toggleClientItem($scope.pageConfig.clients[0]);
          // $scope.$emit(GlobalEvent.onShowLoading, true);
          // loadUser(()=>{
          //   $scope.$emit(GlobalEvent.onShowLoading, false);
          // });
        }

        init();
      }]);
