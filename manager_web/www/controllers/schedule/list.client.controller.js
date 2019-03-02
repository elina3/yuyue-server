'use strict';
angular.module('YYWeb').controller('ScheduleListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth, HospitalService) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }

      $scope.pageConfig = {
        navIndexes: [1, 3],
        searchKey: '',
        currentDepartment: {id: '', text: '全部科室'},
        departments: [{id: '', text: '全部科室'}],
        currentType: {id: '', text: '全部门诊类型',},
        types: [{id: '', text: '全部门诊类型'}, {id: 'expert', text: '专家门诊'}, {id: 'normal', text: '普通门诊'}],
        doctorList: [],
        // pagination: {
        //   currentPage: 1,
        //   limit: 2,
        //   totalCount: 0,
        //   isShowTotalInfo: true,
        //   onCurrentPageChanged: function (callback) {
        //     loadDoctors(function(){
        //       alert('page changed!');
        //     });
        //   }
        // },
        popBox: {
          show: false,
          inputNumber: 0,
          currentDoctor: null,
          open: function(doctor){
            this.inputNumber = parseFloat(doctor.priceNumber) || 0;
            this.currentDoctor = doctor;
            this.show = true;
          },
          sure: function(){
            $scope.$emit(GlobalEvent.onShowLoading, true);
            UserService.setDoctorPrice({doctor_id: this.currentDoctor.id, price: this.inputNumber}, function(err, data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              $scope.pageConfig.popBox.currentDoctor.priceNumber = $scope.pageConfig.popBox.inputNumber;
              $scope.pageConfig.popBox.currentDoctor.price = $scope.pageConfig.popBox.inputNumber.toString();
              $scope.pageConfig.popBox.inputNumber = 0;
              $scope.pageConfig.popBox.show = false;
              $scope.$emit(GlobalEvent.onShowAlert, '设置成功！');
            });
          },
          cancel: function(){
            this.currentDoctor = null;
            this.inputNumber = 0;
            this.show = false;
          }
        }
      };

      function loadDoctors(callback){
        UserService.getAllDoctors({
          department_id: $scope.pageConfig.currentDepartment.id,
          outpatient_type: $scope.pageConfig.currentType.id,
          nickname: $scope.pageConfig.searchKey
        }, function(err, data){
          if(err){
            console.log(err);
            return $scope.$emit(GlobalEvent.onShowAlert, '获取医生信息失败！');
          }

          $scope.pageConfig.doctorList = data.doctors.map(function(item){
            var price = item.price ? parseFloat(item.price / 100) : 0;
            return {
              id: item._id,
              department: item.department.name,
              name: item.nickname,
              outpatientType: UserService.translateOutpatientType(item.outpatient_type),
              price: price === 0 ? '--' : price,
              priceNumber: price,
              statusString: item.on_shelf ? '已上架' : '未上架',
              status: item.on_shelf ? 'onShelf' : 'offShelf'
            };
          });

          // $scope.pageConfig.pagination.totalCount = 3;
          // $scope.pageConfig.pagination.limit = 2;
          // $scope.pageConfig.pagination.pageCount = Math.ceil($scope.pageConfig.pagination.totalCount / $scope.pageConfig.pagination.limit);
          return callback();
        });
      }


      function loadDepartmentList(){
        HospitalService.getDepartments({}, function(err, data){
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          data.departments = data.departments || [];
          console.log(data.departments);
          if(data.departments.length > 0){
            $scope.pageConfig.departments =  $scope.pageConfig.departments.concat(data.departments.map(function(item) {
              return {
                id: item._id,
                text: item.name
              };
            }));
          }
        });
      }


      $scope.settingPrice = function(doctor){
        $scope.pageConfig.popBox.open(doctor);
      };

      $scope.upperShelf = function(doctor){
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您确定要上架吗？', callback: function (status) {
          $scope.$emit(GlobalEvent.onShowLoading, true);
          UserService.onShelfDoctor({doctor_id: doctor.id}, function(err){
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            doctor.status = 'onShelf';
            doctor.statusString='已上架';
            $scope.$emit(GlobalEvent.onShowAlert, '成功上架！');
          });
        }});
      };

      $scope.lowerShelf = function(doctor){
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您确定要下架吗？', callback: function (status) {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            UserService.offShelfDoctor({doctor_id: doctor.id}, function(err){
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              doctor.status = 'offShelf';
              doctor.statusString='已下架';
              $scope.$emit(GlobalEvent.onShowAlert, '成功下架！');
            });
        }});
      };

      $scope.search = function(){
        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadDoctors(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      };


      $scope.settingSchedule = function(doctor){
        console.log(doctor);
        var url = $state.href('schedule_setting',{id: doctor.id});
        window.open(url,'_blank');
      };


      function init() {
        loadDepartmentList();

        $scope.$emit(GlobalEvent.onShowLoading, true);
        loadDoctors(function(){
          $scope.$emit(GlobalEvent.onShowLoading, false);
        });
      }

      init();
    }]);
