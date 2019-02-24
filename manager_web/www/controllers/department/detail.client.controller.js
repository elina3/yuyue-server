'use strict';
angular.module('YYWeb').controller('DepartmentDetailController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }


        function loadUser(callback){
          $scope.pageConfig.user = {
            id: '3',
            staffNumber: '201893421345',
            name: '刘医生',
            IDCard: '320825198805177833',
            mobile: '18321119877',
            department: '心外科',
            role: '医生',
            outpatientType: '专家门诊',
            jobTitle: '副主任医师',
            clients: ['后台管理端', '取号端'],
            modules: [['用户管理', '科室管理'], ['取号']],
            goodAt: '诊疗特色为低位直肠癌保肛术，熟练掌握普通外科疾病，尤其是胃肠道及肛门良、恶性疾病的诊断和治疗。擅长结直肠肿瘤（结肠癌、直肠癌、低位直肠癌、肛管癌、小肠间质瘤、结直肠间质瘤）、胃癌（胃间质瘤）、食管癌、胰腺癌、腹壁疝、炎症性肠病（溃疡性结肠炎、克罗恩氏病）、便秘、肠瘘的外科治疗，肛门良性病（痔疮、肛裂、肛周脓肿、肛瘘）等手术治疗和微创治疗',
            brief: '牛二，外科学博士，中山大学附属第六医院副研究员，医学百事通志愿者医师，外科学硕士生导师，美国营养学会 (ASN)会员，美国微生物学会 (ASM)会员，“广东省医学会肠外肠内营养学分会青年委员会”委员，中山大学“百人计划”引进人才。为Ann Surg，Am J Clin Nutr, Infect Immun, Aliment Pharmacol Ther等多个SCI杂志审稿人。',
            headUrl: '../../images/global/default_user.png'
          };
          return callback();
        }

        $scope.pageConfig = {
          navIndexes: [1, 1],
          user: {},
        };


        $scope.goBack = function () {
          $window.history.back();
        };


        $scope.goState = function (state) {
          if (!state) {
            return;
          }
          $state.go(state);
        };
        $scope.goToView = function (state) {
          if (!state) {
            return;
          }

          switch (state) {
            case 'user_manager':
              return $state.go('user_manager');
            case 'restaurant':
              $state.go('goods_manager', {goods_type: 'dish'});
              return;
            case 'supermarket':
              if (user.role === 'admin' || user.role === 'supermarket_manager') {
                $state.go('supermarket_order');
              }
              return;
            default:
              return;
          }
        };

        function init() {
          console.log('params.id:', $stateParams.id);


          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadUser(()=>{
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
