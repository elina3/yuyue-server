'use strict';
angular.module('YYWeb').controller('JobTitleAddController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        $scope.pageConfig = {
          navIndexes: [1, 2],
          user: {
            selectedClientIds: ['manager']
          },
          departments: [{id: 1, text: '呼吸内科'}, {id: 2, text: '心血管内科'}],
          jobTitles: [{id: 1, text: '副主任医师'}, {id: 2, text: '主任医师'}, {id: 3, text: '护士'}],
          roles: [{id: 1, text: '后台管理员'}, {id: 2, text: '医生'}, {id: 3, text: '护士'}, {id: 4, text: '财务'}],
          clients: [
            {id: 'manager', text: '后台管理端'}, 
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
            outpatientType: '专家门诊',
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
          callback();
        }

        $scope.saveUser = function(){
          $scope.$emit(GlobalEvent.onShowLoading, true);
          saveOneUser(()=>{
            $scope.$emit(GlobalEvent.onShowLoading, false);
            $state.go('user_list');
          });
        };

        function init() {
          console.log('params.id:', $stateParams.id);


          toggleClientItem($scope.pageConfig.clients[0]);
          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadUser(()=>{
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
