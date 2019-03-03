'use strict';
angular.module('YYWeb').controller('ScheduleSettingController',
    [
      '$window',
      '$rootScope',
      '$scope',
      '$stateParams',
      'GlobalEvent',
      '$state',
      'UserService',
      'Auth',
      'ExcelReadSupport',
      function(
          $window, $rootScope, $scope, $stateParams, GlobalEvent, $state,
          UserService, Auth, ExcelReadSupport) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }

        function getWeekName(date) {
          var day = date.getDay();
          switch (day) {
            case 0:
              return '星期日';
            case 1:
              return '星期一';
            case 2:
              return '星期二';
            case 3:
              return '星期三';
            case 4:
              return '星期四';
            case 5:
              return '星期五';
            case 6:
              return '星期六';
          }
        }

        function getCurrentDate() {
          return $scope.pageConfig.calendar.currentDateItem ? $scope.pageConfig.calendar.currentDateItem.date : new Date(new Date().Format('YYYY/MM/DD'));
        }

        function loadDoctorSchedules(doctorId, callback) {
          var currentDate = getCurrentDate();
          UserService.getDoctorSchedules(
              { doctor_id: doctorId, timestamp: currentDate.getTime() },
              function(err, data) {
                if (err) {
                  $scope.$emit(GlobalEvent.onShowAlert, err);
                } else {
                  $scope.pageConfig.doctor.name = data.doctor ? data.doctor.nickname : '';
                  $scope.pageConfig.doctorSchedules = data.schedules.map(
                      function(item) {
                        return {
                          id: item._id,
                          startTime: item.start_time_string,
                          endTime: item.end_time_string,
                          numberCount: item.number_count,
                          booked: 0,
                        };
                      });
                  return callback();
                }

                return callback();
              });
        }

        $scope.pageConfig = {
          isSelfUser: true,//默认是医生为自己设置号源
          doctorId: '',
          doctor: {
            name: '刘医生',
          },
          doctorSchedules: [],
          datePicker: {
            createTimeRange: '',
            createTimeMinTime: moment().format('YYYY/MM/DD'),
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
              format: 'YYYY月MM日DD',
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
          calendar: {
            dateItems: [],
            currentDateItem: null,
            beginIndex: 1,
            endIndex: 7,
            initBoard: function(date) {
              var yesterday = new Date((date.getTime() - 24 * 60 * 60 * 1000));
              console.log('yesterday', yesterday);
              console.log(date);
              this.dateItems = [];
              this.dateItems.push({
                date: yesterday,
                number: yesterday.Format('MM月dd日'),
                weekName: getWeekName(yesterday),
                show: false,
              });
              this.dateItems.push({
                date: date,
                number: date.Format('MM月dd日'),
                weekName: getWeekName(date),
                show: true,
              });
              for (var i = 1; i <= 58; i++) {
                var currentDate = new Date(date.getTime() + i * 24 * 60 * 60 *
                    1000);

                this.dateItems.push({
                  date: currentDate,
                  number: currentDate.Format('MM月dd日'),
                  weekName: getWeekName(currentDate),
                  show: i <= 6,
                });
              }
              this.clickDate(this.dateItems[1]);
            },
            prevDate: function() {
              var prevDateItem = this.dateItems[this.beginIndex - 1];
              if (prevDateItem) {
                this.dateItems[this.endIndex].show = false;
                prevDateItem.show = true;
                this.beginIndex -= 1;
                this.endIndex -= 1;
              }
            },
            nextDate: function() {
              var nextDateItem = this.dateItems[this.endIndex + 1];
              if (nextDateItem) {
                this.dateItems[this.beginIndex].show = false;
                nextDateItem.show = true;
                this.beginIndex += 1;
                this.endIndex += 1;
              }
            },
            clickDate: function(dateItem) {
              if ($scope.pageConfig.calendar.currentDateItem) {
                $scope.pageConfig.calendar.currentDateItem.current = false;
              }
              dateItem.current = true;
              $scope.pageConfig.calendar.currentDateItem = dateItem;
              $scope.$emit(GlobalEvent.onShowLoading, true);
              loadDoctorSchedules($scope.pageConfig.doctorId, function() {
                $scope.$emit(GlobalEvent.onShowLoading, false);
              });
            },
          },
          popBox: {
            show: false,
            dateString: '',
            inputNumber: 50,
            startTime: {
              hour: 8,
              minute: 0,
            },
            endTime: {
              hour: 11,
              minute: 0,
            },
            currentSchedule: null,
            reset: function() {
              this.currentSchedule = null;
              this.inputNumber = 50;
              this.startTime = {
                hour: 8,
                minute: 0,
              };
              this.endTime = {
                hour: 11,
                minute: 0,
              };
            },
            open: function(schedule) {
              console.log(schedule);
              this.dateString = $scope.pageConfig.calendar.currentDateItem.number;
              if (schedule) {
                console.log(schedule.startTime.split(':')[0]);
                console.log(schedule.startTime.split(':')[1]);
                this.inputNumber = schedule.numberCount;
                this.currentSchedule = schedule;
                this.startTime.hour = parseInt(
                    schedule.startTime.split(':')[0]);
                this.startTime.minute = parseInt(
                    schedule.startTime.split(':')[1]);
                this.endTime.hour = parseInt(schedule.endTime.split(':')[0]);
                this.endTime.minute = parseInt(schedule.endTime.split(':')[1]);
              }
              this.show = true;
            },
            sure: function() {
              if (this.inputNumber === 0) {
                $scope.$emit(GlobalEvent.onShowAlert, '号源数量至少设置为1！');
                return;
              }

              if (this.endTime.hour < this.startTime.hour) {
                $scope.$emit(GlobalEvent.onShowAlert, '结束时间大于开始时间！');
                return;
              }

              if (this.endTime.hour === this.startTime.hour &&
                  this.endTime.minute <= this.startTime.minute) {
                $scope.$emit(GlobalEvent.onShowAlert, '结束时间大于开始时间！');
                return;
              }

              if (this.currentSchedule) {

                let currentDate = getCurrentDate();
                let dateString = currentDate.Format('yyyy/MM/dd');

                UserService.modifyDoctorSchedule({
                  doctor_schedule_id: this.currentSchedule.id,
                  doctor_id: $scope.pageConfig.doctorId,
                  start_timestamp: new Date(dateString + ' ' +
                      this.startTime.hour + ':' +
                      this.startTime.minute).getTime(),
                  end_timestamp: new Date(dateString + ' ' +
                      (this.endTime.hour + ':' +
                          this.endTime.minute)).getTime(),
                  number_count: this.inputNumber,
                }, function(err) {
                  $scope.$emit(GlobalEvent.onShowLoading, false);
                  if (err) {
                    return $scope.$emit(GlobalEvent.onShowAlert, err);
                  }

                  $scope.$emit(GlobalEvent.onShowLoading, true);
                  loadDoctorSchedules($scope.pageConfig.doctorId, function() {
                    $scope.$emit(GlobalEvent.onShowLoading, false);
                  });

                  return $scope.$emit(GlobalEvent.onShowAlert, '编辑成功');
                });

              } else {
                console.log('请求保存');
                //todo 请求保存
                let currentDate = getCurrentDate();
                let dateString = currentDate.Format('yyyy/MM/dd');
                let newScheduleObj = {
                  doctor_id: $scope.pageConfig.doctorId,
                  start_timestamp: new Date(dateString + ' ' +
                      this.startTime.hour + ':' +
                      this.startTime.minute).getTime(),
                  end_timestamp: new Date(dateString + ' ' +
                      (this.endTime.hour + ':' +
                          this.endTime.minute)).getTime(),
                  number_count: this.inputNumber,
                };
                $scope.$emit(GlobalEvent.onShowLoading, true);
                UserService.addDoctorSchedule(newScheduleObj,
                    function(err, data) {
                      $scope.$emit(GlobalEvent.onShowLoading, false);
                      if (err) {
                        return $scope.$emit(GlobalEvent.onShowAlert, err);
                      }

                      if (data.schedule) {
                        $scope.pageConfig.doctorSchedules.push({
                          id: data.schedule._id,
                          numberCount: data.schedule.number_count,
                          startTime: data.schedule.start_time_string,
                          endTime: data.schedule.end_time_string,
                          booked: 0,
                        });
                      }
                      return $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
                    });
              }
              this.show = false;
              this.reset();
            },
            cancel: function() {
              this.show = false;
              this.reset();
            },
          },
        };

        $scope.addDoctorSchedule = function() {
          $scope.pageConfig.popBox.open();
        };

        $scope.editDoctorSchedule = function(schedule) {
          $scope.pageConfig.popBox.open(schedule);
        };

        function deleteSchedule(schedule) {
          $scope.$emit(GlobalEvent.onShowLoading, true);
          UserService.deleteDoctorSchedule(
              { doctor_id: $scope.pageConfig.doctorId, schedule_id: schedule.id },
              function(err) {
                $scope.$emit(GlobalEvent.onShowLoading, false);
                if (err) {
                  return $scope.$emit(GlobalEvent.onShowAlert, err);
                }

                loadDoctorSchedules($scope.pageConfig.doctorId);

                return $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
              });
        }

        $scope.deleteSchedule = function(schedule) {
          $scope.$emit(GlobalEvent.onShowAlertConfirm, {
            content: '您确定要删除该号源吗？', callback: function() {
              deleteSchedule(schedule);
            },
          });
        };

        function init() {
          let assignDoctorId = $stateParams.id;//如果传入doctorId，为指定医生设置账号
          console.log('assignDoctorId:', assignDoctorId);

          $scope.pageConfig.isSelfUser = assignDoctorId === user._id;//用户是否为自己，不是自己则显示姓名

          $scope.pageConfig.doctorId = assignDoctorId || user._id;

          if ($scope.pageConfig.isSelfUser) {//如果是自己为自己设置号源，自己必须为医生
            if (user.role !== 'doctor') {
              return $scope.$emit(GlobalEvent.onShowAlert,
                  '很抱歉，您不是医生，不能为您设置号源！请联系管理员！');
            }
          }

          $scope.pageConfig.calendar.initBoard(
              new Date(moment().format('YYYY/MM/DD')));
        }

        init();


        //<editor-fold desc="导入相关">

        var importSheet = {A1: '工号', B1: '日期', C1: '开始时间', D1: '结束时间', E1: '号源数量'};

        function generateImportScheduleList(data, extDatas) {
          var scheduleList = [];
          for (var i = 0; i < data.length; i++) {
            var obj = {
              username: data[i][importSheet.A1],
              date: data[i][importSheet.B1],
              start_time: data[i][importSheet.C1],
              end_time: data[i][importSheet.D1],
              number_count: data[i][importSheet.E1],
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
        function uploadSchedule(scheduleInfo, param, i, callback) {
          UserService.batchImportSchedules(param, function (err, data) {

            if (err) {
              return callback(err);
            }

            importSchedules = importSchedules.concat(data.cards);
            existSchedules = existSchedules.concat(data.existCards);
            console.log(data);
            if (scheduleInfo[i]) {
              var newParam = {
                card_list: scheduleInfo[i++],
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
            card_list: queue[0],
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

          $scope.$emit(GlobalEvent.onShowLoading, true);
          batchUploadSchedules(function(err){

            $scope.$emit(GlobalEvent.onShowLoading, false);
            if(err){
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            return $scope.$emit(GlobalEvent.onShowAlert, '成功导入'+importSchedules.length+'个饭卡!已存在'+ existSchedules.length+'个');
          });
        };
        //</editor-fold>

      }]);
