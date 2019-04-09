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

        function getAppointmentTime(){
          if ($scope.pageConfig.appointmentTime && $scope.pageConfig.appointmentTime.startDate &&
              $scope.pageConfig.appointmentTime.startDate._d) {
            var time = moment($scope.pageConfig.appointmentTime.startDate);
            return new Date(new Date(time).Format('yyyy-MM-dd 00:00:00'));
          }else{
            return null;
          }
        }
        function loadAppointments(callback) {

          let searchObj = {
            search_key: $scope.pageConfig.searchKey,
            current_page: $scope.pageConfig.pagination.currentPage,
            limit: $scope.pageConfig.pagination.limit,
            outpatient_type: $scope.pageConfig.currentType.id,
            department_id: $scope.pageConfig.currentDepartment.id,
          };
          if(getAppointmentTime()){
            searchObj.appointment_timestamp = getAppointmentTime().getTime();
          }

          $scope.$emit(GlobalEvent.onShowLoading, true);
          AppointmentService.getList(searchObj, function(err, data) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            console.log('card_type', data);
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
          appointmentTime: null,
          types: [
            { id: '', text: '全部门诊类型' },
            { id: 'expert', text: '专家门诊' },
            { id: 'normal', text: '普通门诊' }],
          appointmentList: [],
          pagination: {
            currentPage: 1,
            limit: 20,
            totalCount: 0,
            isShowTotalInfo: true,
            onCurrentPageChanged: function(callback) {
              loadAppointments(function() {});
            },
          },
          groupList: [],
          datePicker: {
            dateOptions: {
              locale: {
                fromLabel: '起始时间',
                toLabel: '结束时间',
                cancelLabel: '取消',
                applyLabel: '确定',
                customRangeLabel: '区间',
                daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                firstDay: 1,
                monthNames: [
                  '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
                  '十月', '十一月', '十二月'],
              },
              timePicker: false,
              timePicker12Hour: false,
              timePickerIncrement: 1,
              singleDatePicker: true,
              separator: ' ~ ',
              format: 'YYYY年MM月DD日',
            },
            getCurrentDate: function() {
              if (this.createTimeRange.startDate &&
                  this.createTimeRange.startDate._d) {
                var time = moment(this.createTimeRange.startDate);
                return new Date(time);
              }
              return new Date(moment().format('YYYY/MM/DD'));//默认时间
            },
          },
          changeDate: function() {
            this.calendar.initBoard(this.datePicker.getCurrentDate());
          },
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
