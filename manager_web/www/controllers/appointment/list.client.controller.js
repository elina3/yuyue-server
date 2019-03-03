'use strict';
angular.module('YYWeb').controller('AppointmentListController',
    [
      '$window',
      '$rootScope',
      '$scope',
      'GlobalEvent',
      '$state',
      'UserService',
      'Auth',
      'HospitalService',
      'AppointmentService',
      'MemberService',
      function(
          $window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth,
          HospitalService, AppointmentService, MemberService) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        function loadAppointments(callback) {

          $scope.$emit(GlobalEvent.onShowLoading, true);
          AppointmentService.getList({
            search_key: $scope.pageConfig.searchKey,
            current_page: $scope.pageConfig.pagination.currentPage,
            limit: $scope.pageConfig.pagination.limit,
            outpatient_type: $scope.pageConfig.currentType.id,
            department_id: $scope.pageConfig.currentDepartment.id,
          }, function(err, data) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            data.appointments = data.appointments || [];
            $scope.pageConfig.appointmentList = data.appointments.map(
                function(item) {
                  return {
                    id: item._id,
                    orderNumber: item.order_number,
                    name: item.nickname,
                    IDCard: item.IDCard,
                    cardType: MemberService.translateCardType(item.card_type) || '无',
                    cardNumber: item.card_number || '无',
                    role: UserService.translateUserRole(item.role),
                  };
                });

            $scope.pageConfig.pagination.totalCount = data.total_count;
            $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
            return callback();
          });
        }

        $scope.pageConfig = {
          navIndexes: [0],
          currentDepartment: { id: '', text: '全部科室' },
          departments: [{ id: '', text: '全部科室' }],
          searchKey: '',
          currentType: { id: '', text: '全部门诊类型' },
          types: [
            { id: '', text: '全部门诊类型' },
            { id: 'expert', text: '专家门诊' },
            { id: 'normal', text: '普通门诊' }],
          appointmentList: [],
          pagination: {
            currentPage: 1,
            limit: 2,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function(callback) {
              loadAppointments(function() {});
            },
          },
          groupList: [],
        };

        $scope.search = function() {
          $scope.pageConfig.pagination.currentPage = 1;
          $scope.pageConfig.pagination.totalCount = 0;
          loadAppointments(function() {});
        };

        function loadDepartmentList() {
          HospitalService.getDepartments({}, function(err, data) {
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err.zh_message);
            }

            data.departments = data.departments || [];
            if (data.departments.length > 0) {
              $scope.pageConfig.departments = $scope.pageConfig.departments.concat(
                  data.departments.map(function(item) {
                    return {
                      id: item._id,
                      text: item.name,
                    };
                  }));
            }
          });
        }

        function init() {

          loadDepartmentList();

          loadAppointments(function() {});
        }

        init();
      }]);
