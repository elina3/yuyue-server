'use strict';
angular.module('YYWeb').controller('UserAddController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth, HospitalService) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        $scope.pageConfig = {
          navIndexes: [1, 0],
          user: {
            selectedClientIds: ['manager'],
            password: '654321'
          },
          departments: [{id: 1, text: '呼吸内科'}, {id: 2, text: '心血管内科'}],
          jobTitles: [{id: 1, text: '副主任医师'}, {id: 2, text: '主任医师'}, {id: 3, text: '护士'}],
          outpatient_types: [{id: '', text: '无'}, {id: 'expert', text: '专家门诊'}, {id: 'normal', text: '普通门诊'}],
          roles: [{id: 'admin', text: '后台管理员'}, {id: 'doctor', text: '医生'}, {id: 'pick_up', text: '取号人员'}, {id: 'financial', text: '财务专员'}],
          clients: [
            {id: 'manager', text: '管理端'},
            {id: 'doctor', text: '医生端'}, 
            {id: 'pick-up', text: '取号端'}
          ],
          modulesDic: {
            'manager': [
              {id: '1a', text: '首页', selected: true},
              {id: '1b', text: '用户管理', selected: true},
              {id: '1c', text: '科室管理', selected: true},
              {id: '1d', text: '职称管理', selected: true},
              {id: '1e', text: '账单管理', selected: true},
              {id: '1f', text: '就诊卡管理', selected: true},
              {id: '1g', text: '页面管理', selected: true},
            ],
            'doctor': [{id: '2a', text: '排班管理', selected: true}],
            'pick-up': [{id: '3a', text: '取号打印', selected: true}] 
          }
        };

        function loadUser(callback){
          $scope.pageConfig.user = {
            id: '3',
            staffNumber: '',
            name: '',
            IDCard: '',
            mobile: '',
            department: $scope.pageConfig.departments[0],
            role: $scope.pageConfig.roles[0],
            outpatientType: $scope.pageConfig.outpatient_types[0],
            jobTitle: $scope.pageConfig.jobTitles[0],
            selectedClientIds: ['manager'],
            goodAt: '诊疗特色为低位直肠癌保肛术，熟练掌握普通外科疾病，尤其是胃肠道及肛门良、恶性疾病的诊断和治疗。擅长结直肠肿瘤（结肠癌、直肠癌、低位直肠癌、肛管癌、小肠间质瘤、结直肠间质瘤）、胃癌（胃间质瘤）、食管癌、胰腺癌、腹壁疝、炎症性肠病（溃疡性结肠炎、克罗恩氏病）、便秘、肠瘘的外科治疗，肛门良性病（痔疮、肛裂、肛周脓肿、肛瘘）等手术治疗和微创治疗',
            brief: '牛二，外科学博士，中山大学附属第六医院副研究员，医学百事通志愿者医师，外科学硕士生导师，美国营养学会 (ASN)会员，美国微生物学会 (ASM)会员，“广东省医学会肠外肠内营养学分会青年委员会”委员，中山大学“百人计划”引进人才。为Ann Surg，Am J Clin Nutr, Infect Immun, Aliment Pharmacol Ther等多个SCI杂志审稿人。',
            headUrl: '../../images/global/default_user.png'
          };
          return callback();
        }

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
