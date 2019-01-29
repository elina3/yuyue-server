/**
 * Created by elinaguo on 16/3/16.
 */
'use strict';
angular.module('YYWeb').controller('UserManagerController',
['$window', '$rootScope', '$stateParams', '$scope', 'GlobalEvent', '$state', 'UserService',  'Auth',
function ($window, $rootScope, $stateParams, $scope, GlobalEvent, $state, UserService, Auth) {

      $scope.batchRechargeShow = false;
      $scope.pageConfig = {
        clientScanType: '',
        clientRoles: [{id: 'normal', text: '普通用户'}, {id: 'waiter', text: '服务员'}, {id: 'cashier', text: '收银员'},],
        roles: [
          {id: 'card_manager', text: '饭卡管理员'},
          {id: 'normal_card_manager', text: '普通饭卡管理员'},
          {id: 'staff_card_manager', text: '员工专家饭卡管理员'},
          {id: 'delivery', text: '配送员'},
          {id: 'cooker', text: '厨师'},
          {id: 'nurse', text: '护士'},
          {id: 'registrar', text: '登记员'},
          {id: 'supermarket_manager', text: '超市管理员'}],
        cardTypes: [{id: 'normal', text: '普通'}, {id: 'staff', text: '员工'}, {id: 'expert', text: '专家'}],
        rechargeTypes: [{id: 'cash', text: '现金'}, {id: 'virtual', text: '虚拟'}],
        groups: [],
        sexs: [{id: 'male', text: '男'}, {id: 'female', text: '女'}],
        currentTag: 'platform-user',
        groupList: [{id: '', text: '餐厅'}, {id: '', text: ''}],
        popMaskShow: false,
        plat_user_panel: {
          show_plat: false,
          passwordModify: false,
          users: [],
          currentEditUser: null,
          errorInfo: {
            username: false,
            password: false,
            nickname: false,
            group: false,
            mobile_phone: false,
            role: false
          },
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function (callback) {
              
            }
          }
        },
        plat_client_panel: {
          show_plat: false,
          client_users: [],
          passwordModify: false,
          currentEditClient: null,
          errorInfo: {
            username: false,
            password: false,
            nickname: false,
            mobile_phone: false,
            role: false
          },
          pagination: {
            currentPage: 1,
            limit: 10,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function (callback) {
              
            }
          }
        }
      };

      $scope.user = {};

      $scope.goBack = function () {
        $window.history.back();
      };

      $scope.changeTag = function (tagName) {

      };

      $scope.closePopMask = function () {
        $scope.pageConfig.popMaskShow = false;
        $scope.pageConfig.scanType = '';
        $scope.pageConfig.clientScanType = '';

        $scope.pageConfig.plat_user_panel.show_plat = false;
        $scope.pageConfig.plat_card_panel.show_plat = false;
        $scope.pageConfig.plat_client_panel.show_plat = false;
        $scope.batchRechargeShow = false;

        $scope.pageConfig.plat_client_panel.passwordModify = false;
        $scope.pageConfig.plat_user_panel.passwordModify = false;
      };


      function init() {
        var panelType = $stateParams.panel_type;
        if (panelType) {
          $scope.pageConfig.currentTag = panelType;
        } else if ($scope.user.role === 'admin') {
          $scope.pageConfig.currentTag = 'platform-user';
        } else {
          $scope.pageConfig.currentTag = 'card-user';
        }

        if ($scope.user.role === 'normal_card_manager') {
          $scope.pageConfig.cardTypes = [{id: 'normal', text: '普通'}];
        } else if ($scope.user.role === 'staff_card_manager') {
          $scope.pageConfig.cardTypes = [{id: 'staff', text: '员工'}, {id: 'expert', text: '专家'}];
        }

        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.getGroups({currentPage: 1, limit: -1, skipCount: 0}, function (err, data) {
          if (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.group_list.forEach(function (group) {
            $scope.pageConfig.groups.push({id: group._id, text: group.name});
          });

        });
      }

      init();

      $scope.goState = function (state) {
        if (state) {
          $state.go(state);
        }
      };
    }]);
