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
    function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state,
              UserService, Auth) {
      var user = Auth.getUser();
      if (!user) {
        $state.go('user_sign_in');
        return;
      }
      console.log(user);

      var priceTypeDic = {
        price: '专家',
        special_price: '特需'
      };

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
          {doctor_id: doctorId, timestamp: currentDate.getTime()},
          function (err, data) {
            if (err) {
              $scope.$emit(GlobalEvent.onShowAlert, err);
            } else {
              console.log(data.doctor);
              $scope.pageConfig.doctor.name = data.doctor ? data.doctor.nickname : '';
              $scope.pageConfig.doctor.department = data.doctor ? data.doctor.department_name : '';
              $scope.pageConfig.doctor.on_shelf = data.doctor.on_shelf;
              $scope.pageConfig.doctor.outpatient_type = data.doctor.outpatient_type;
              $scope.pageConfig.doctor.price = data.doctor.price;
              $scope.pageConfig.doctor.special_price = data.doctor.special_price || 0;
              $scope.pageConfig.popBox.hasSpecialPrice = data.doctor.special_price > 0;
              $scope.pageConfig.showButton = true;
              $scope.pageConfig.doctorSchedules = data.schedules.map(
                function (item) {
                  item.price_type = item.price_type || 'price';
                  item.price = item.price || data.doctor.price;
                  return {
                    id: item._id,
                    startTime: item.start_time_string,
                    endTime: item.end_time_string,
                    numberCount: item.number_count,
                    booked: item.booked || 0,
                    price_type: item.price_type,
                    priceTypeString: data.doctor.outpatient_type === 'expert' ? priceTypeDic[item.price_type] : '普通',
                    price: item.price / 100,
                    is_stopped: item.is_stopped || false,
                    is_over: new Date(item.end_time).getTime() - new Date().getTime() <= 0
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
        showButton: false,//控制上下架按钮显示与隐藏
        doctor: {
          name: '刘医生',
          on_shelf: false,//默认没有上架
          outpatient_type: '',
          price: 0,
          special_price: 0
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
            format: 'YYYY年MM月DD日',
          },
          getCurrentDate: function () {
            if (this.createTimeRange.startDate &&
              this.createTimeRange.startDate._d) {
              var time = moment(this.createTimeRange.startDate);
              return new Date(time);
            }
            return new Date(moment().format('YYYY/MM/DD'));//默认时间
          },
        },
        changeDate: function () {
          this.calendar.initBoard(this.datePicker.getCurrentDate());
        },
        calendar: {
          dateItems: [],
          currentDateItem: null,
          beginIndex: 1,
          endIndex: 7,
          initBoard: function (date) {
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
          prevDate: function () {
            var prevDateItem = this.dateItems[this.beginIndex - 1];
            if (prevDateItem) {
              this.dateItems[this.endIndex].show = false;
              prevDateItem.show = true;
              this.beginIndex -= 1;
              this.endIndex -= 1;
            }
          },
          nextDate: function () {
            var nextDateItem = this.dateItems[this.endIndex + 1];
            if (nextDateItem) {
              this.dateItems[this.beginIndex].show = false;
              nextDateItem.show = true;
              this.beginIndex += 1;
              this.endIndex += 1;
            }
          },
          clickDate: function (dateItem) {
            if ($scope.pageConfig.calendar.currentDateItem) {
              $scope.pageConfig.calendar.currentDateItem.current = false;
            }
            dateItem.current = true;
            $scope.pageConfig.calendar.currentDateItem = dateItem;
            $scope.$emit(GlobalEvent.onShowLoading, true);
            loadDoctorSchedules($scope.pageConfig.doctorId, function () {
              $scope.$emit(GlobalEvent.onShowLoading, false);
            });
          },
        },
        popBox: {
          show: false,
          dateString: '',
          inputNumber: 50,
          currentPriceType: {id: 'price', text: '专家门诊'},
          hasSpecialPrice: true,
          priceTypes: [{id: 'price', text: '专家门诊'}, {id: 'special_price', text: '特需门诊'}],
          startTime: {
            hour: 8,
            minute: 0,
          },
          endTime: {
            hour: 11,
            minute: 0,
          },
          currentSchedule: null,
          reset: function () {
            this.currentSchedule = null;
            this.currentPriceType = {id: 'price', text: '专家门诊'};
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
          open: function (schedule) {
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
              if (schedule.price_type) {
                this.currentPriceType = {id: schedule.price_type, text: priceTypeDic[schedule.price_type]};
              }
            }
            this.show = true;
          },
          sure: function () {
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

            if (this.hasSpecialPrice && !this.currentPriceType) {
              $scope.$emit(GlobalEvent.onShowAlert, '请选择价格类型');
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
                price_type: this.hasSpecialPrice ? this.currentPriceType.id : 'price'
              }, function (err) {
                $scope.$emit(GlobalEvent.onShowLoading, false);
                if (err) {
                  return $scope.$emit(GlobalEvent.onShowAlert, err);
                }

                $scope.$emit(GlobalEvent.onShowLoading, true);
                loadDoctorSchedules($scope.pageConfig.doctorId, function () {
                  $scope.$emit(GlobalEvent.onShowLoading, false);
                });

                return $scope.$emit(GlobalEvent.onShowAlert, '编辑成功');
              });

            } else {
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
                price_type: this.hasSpecialPrice ? this.currentPriceType.id : 'price'
              };
              $scope.$emit(GlobalEvent.onShowLoading, true);
              UserService.addDoctorSchedule(newScheduleObj,
                function (err, data) {
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
                      priceTypeString: $scope.pageConfig.doctor.outpatient_type === 'expert' ? priceTypeDic[data.schedule.price_type || 'price'] : '普通',
                      price_type: data.schedule.price_type,
                      price: $scope.pageConfig.doctor[data.schedule.price_type] / 100
                    });
                  }
                  return $scope.$emit(GlobalEvent.onShowAlert, '保存成功');
                });
            }
            this.show = false;
            this.reset();
          },
          cancel: function () {
            this.show = false;
            this.reset();
          },
        },
      };

      $scope.addDoctorSchedule = function () {
        $scope.pageConfig.popBox.open();
      };

      $scope.editDoctorSchedule = function (schedule) {
        $scope.pageConfig.popBox.open(schedule);
      };

      function stopDoctorSchedule(schedule) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.stopDoctorSchedule(
          {doctor_id: $scope.pageConfig.doctorId, schedule_id: schedule.id},
          function (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            loadDoctorSchedules($scope.pageConfig.doctorId);

            return $scope.$emit(GlobalEvent.onShowAlert, '停诊成功');
          });
      }

      $scope.stopDoctorSchedule = function (schedule) {
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {
          content: '您确定要停诊吗？', callback: function () {
            stopDoctorSchedule(schedule);
          },
        });
      };

      function repeatStartDoctorSchedule(schedule) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.repeatStartDoctorSchedule(
          {doctor_id: $scope.pageConfig.doctorId, schedule_id: schedule.id},
          function (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            loadDoctorSchedules($scope.pageConfig.doctorId);

            return $scope.$emit(GlobalEvent.onShowAlert, '重新开诊成功');
          });
      }

      $scope.repeatStartDoctorSchedule = function (schedule) {
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {
          content: '您确定要重新开诊吗？', callback: function () {
            repeatStartDoctorSchedule(schedule);
          },
        });
      };

      function deleteSchedule(schedule) {
        $scope.$emit(GlobalEvent.onShowLoading, true);
        UserService.deleteDoctorSchedule(
          {doctor_id: $scope.pageConfig.doctorId, schedule_id: schedule.id},
          function (err) {
            $scope.$emit(GlobalEvent.onShowLoading, false);
            if (err) {
              return $scope.$emit(GlobalEvent.onShowAlert, err);
            }

            loadDoctorSchedules($scope.pageConfig.doctorId);

            return $scope.$emit(GlobalEvent.onShowAlert, '删除成功');
          });
      }

      $scope.deleteSchedule = function (schedule) {
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {
          content: '您确定要删除该号源吗？', callback: function () {
            deleteSchedule(schedule);
          },
        });
      };


      $scope.upperShelf = function () {
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {
          content: '您确定要上架吗？', callback: function (status) {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            UserService.onShelfDoctor({doctor_id: $scope.pageConfig.doctorId}, function (err) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err) {
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              $scope.pageConfig.doctor.on_shelf = true;
              $scope.$emit(GlobalEvent.onShowAlert, '成功上架！');
            });
          }
        });
      };

      $scope.lowerShelf = function (doctor) {
        $scope.$emit(GlobalEvent.onShowAlertConfirm, {
          content: '您确定要下架吗？', callback: function (status) {
            $scope.$emit(GlobalEvent.onShowLoading, true);
            UserService.offShelfDoctor({doctor_id: $scope.pageConfig.doctorId}, function (err) {
              $scope.$emit(GlobalEvent.onShowLoading, false);
              if (err) {
                return $scope.$emit(GlobalEvent.onShowAlert, err);
              }

              $scope.pageConfig.doctor.on_shelf = false;
              $scope.$emit(GlobalEvent.onShowAlert, '成功下架！');
            });
          }
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

    }]);
