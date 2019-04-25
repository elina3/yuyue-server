'use strict';
angular.module('YYWeb').controller('ScheduleListController',
  ['$window', '$rootScope', '$scope', 'GlobalEvent', '$state', 'UserService', 'Auth', 'HospitalService', 'ExcelReadSupport',
    function ($window, $rootScope, $scope, GlobalEvent, $state, UserService, Auth, HospitalService, ExcelReadSupport) {
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
          specialPriceNumber: 0,
          currentDoctor: null,
          open: function(doctor){
            this.inputNumber = parseFloat(doctor.priceNumber) || 0;
            this.specialPriceNumber = parseFloat(doctor.specialPriceNumber) || 0;
            this.currentDoctor = doctor;
            this.show = true;
          },
          sure: function(){
            $scope.$emit(GlobalEvent.onShowLoading, true);
            UserService.setDoctorPrice({doctor_id: this.currentDoctor.id, price: this.inputNumber, special_price: this.specialPriceNumber}, function(err, data) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if(err){
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              $scope.pageConfig.popBox.currentDoctor.priceNumber = $scope.pageConfig.popBox.inputNumber;
              $scope.pageConfig.popBox.currentDoctor.price = $scope.pageConfig.popBox.inputNumber.toString();
              $scope.pageConfig.popBox.currentDoctor.specialPriceNumber = $scope.pageConfig.popBox.specialPriceNumber;
              $scope.pageConfig.popBox.currentDoctor.specialPrice = $scope.pageConfig.popBox.specialPriceNumber.toString();
              $scope.pageConfig.popBox.inputNumber = 0;
              $scope.pageConfig.popBox.specialPriceNumber = 0;
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
          console.log(data);

          $scope.pageConfig.doctorList = data.doctors.map(function(item){
            var price = item.price ? parseFloat(item.price / 100) : 0;
            var specialPrice = item.special_price ? parseFloat(item.special_price / 100) : 0;
            return {
              id: item._id,
              department: item.department.name,
              name: item.nickname,
              outpatientType: UserService.translateOutpatientType(item.outpatient_type),
              price: price === 0 ? '--' : price,
              priceNumber: price,
              hasSpecialPrice: item.outpatient_type === 'expert',
              specialPrice: specialPrice === 0 ? '--' : specialPrice,
              specialPriceNumber: specialPrice,
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



      //<editor-fold desc="导入相关">

      var importSheet = {A1: '工号', B1: '日期', C1: '开始时间', D1: '结束时间', E1: '号源数量'};

      function generateImportScheduleList(data, extDatas) {
        var scheduleList = [];
        for (var i = 0; i < data.length; i++) {
          var startTimeString = data[i][importSheet.B1] + ' ' + data[i][importSheet.C1];
          var endTimeString = data[i][importSheet.B1] + ' ' + data[i][importSheet.D1];
          var startTime = new Date(startTimeString);
          var endTime = new Date(endTimeString);
          var obj = {
            username: data[i][importSheet.A1],
            date: data[i][importSheet.B1],
            start_time: data[i][importSheet.C1],
            end_time: data[i][importSheet.D1],
            number_count: data[i][importSheet.E1],
            start_timestamp: startTime.getTime(),
            end_timestamp: endTime.getTime()
          };
          scheduleList.push(obj);
        }
        return scheduleList;
      }

      function formatUnitExcel(dataObj) {
        for (var prop in importSheet) {
          if (!dataObj[importSheet[prop]]) {
            dataObj[importSheet[prop]] = '';
          }
        }
      }

      function validExcelData(data) {
        var errors = [];
        for (var i = 0; i < data.length; i++) {
          formatUnitExcel(data[i]);
          for (var key in data[i]) {
            switch (key) {
              case importSheet.A1:
                if (!data[i][key]) {
                  data[i].index = i + 1;
                  data[i].error = {
                    index: i,
                    message: importSheet.A1 + '未填'
                  };
                  errors.push(data[i]);
                }
                break;
              case importSheet.B1:
                if (!data[i][key]) {
                  data[i].error = {
                    index: i,
                    message: importSheet.B1 + '未填'
                  };
                  errors.push(data[i]);
                }
                break;
              default :
                break;
            }
          }
        }

        return {errors: errors};
      }

      function transferExcelData(data) {
        var result = validExcelData(data);
        return {
          success: result.errors.length === 0,
          errors: result.errors,
          schedules: result.errors.length === 0 ? generateImportScheduleList(data, result.extDatas) : []
        };
      }

      $scope.importScheduleArray = [];

      $scope.onFileSelect = function (element) {
        var file = element.files[0];
        var suffix_file = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
        document.getElementById('card-filename').outerHTML = document.getElementById('card-filename').outerHTML;
        document.getElementById('card-filename').value = '';
        if (suffix_file !== 'xls' && suffix_file !== 'xlsx') {
          return $scope.$emit(GlobalEvent.onShowAlert, {content: '选择的文件不是Excel文件'});
        }

        $scope.$apply(function () {
          var sheetColumn = [];//{key: 'A1', value: '姓名'},
          for (var prop in importSheet) {
            sheetColumn.push({
              key: prop,
              value: importSheet[prop]
            });
          }
          ExcelReadSupport.generalDataByExcelFile(file, sheetColumn, function (err, data) {
            if (err) {
              $scope.$emit(GlobalEvent.onShowAlert, {content: err});
              $scope.$apply();
              return;
            }
            var result = transferExcelData(data);
            if (!result.success) {
              $scope.$emit(GlobalEvent.onShowAlert, {content: '数据格式有误，第' + (result.errors[0].error.index + 1) + '条' + result.errors[0].error.message});
              $scope.$apply();
              return;
            }
            console.log('result:', result.schedules);
            $scope.importScheduleArray = result.schedules;
          });
        });
      };



      var importSchedules = [];
      var existSchedules = [];
      var successCount = 0;
      function uploadSchedule(scheduleInfo, param, i, callback) {
        UserService.batchImportSchedules(param, function (err, data) {

          if (err) {
            return callback(err);
          }

          if(data.success_count > 0){
            successCount+=data.success_count;
          }

          importSchedules = importSchedules.concat(data.cards);
          existSchedules = existSchedules.concat(data.existCards);
          console.log(data);
          if (scheduleInfo[i]) {
            var newParam = {
              schedule_infos: scheduleInfo[i++],
              append_method: 'append'
            };
            uploadSchedule(scheduleInfo, newParam, i, callback);
          }
          else {
            return callback();
          }
        }, function (data) {
          console.log(data);
          return callback(data);
        });
      }


      function batchUploadSchedules(callback) {
        var scheduleInfos = $scope.importScheduleArray;
        var queue = [];
        var blockSize = 4;

        var queueSize = Math.ceil(scheduleInfos.length / blockSize);
        for (var i = 1; i <= queueSize; i++) {
          var cardInfoBlock = scheduleInfos.slice((i - 1) * blockSize, i * blockSize);
          var subQueue = [];
          cardInfoBlock.forEach(function (cardInfo) {
            subQueue.push(cardInfo);
          });
          queue.push(subQueue);
        }

        var param = {
          schedule_infos: queue[0],
          append_method: 'replace'
        };
        uploadSchedule(queue, param, 1, callback);
      }


      $scope.batchImportSchedules = function () {
        if ($scope.importScheduleArray.length === 0)
          return;
        $scope.$emit(GlobalEvent.onShowLoading, true);
        importSchedules = [];
        existSchedules = [];
        successCount = 0;

        $scope.$emit(GlobalEvent.onShowLoading, true);
        batchUploadSchedules(function(err){

          $scope.$emit(GlobalEvent.onShowLoading, false);
          if(err){
            return $scope.$emit(GlobalEvent.onShowAlert, err);
          }

          return $scope.$emit(GlobalEvent.onShowAlert, '成功导入' + successCount+ '条记录');
        });
      };
      $scope.goToSettingRole = function () {
        $state.go('setting_role');
      };
      //</editor-fold>

    }]);
