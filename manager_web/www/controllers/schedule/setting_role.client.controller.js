'use strict';
angular.module('YYWeb').controller('SettingRoleController',
    [
      '$window',
      '$rootScope',
      '$scope',
      '$stateParams',
      'GlobalEvent',
      '$state',
      'UserService',
      'Auth',
      function(
          $window, $rootScope, $scope, $stateParams, GlobalEvent, $state,
          UserService, Auth) {
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
                  console.log(data);
                  $scope.pageConfig.doctor.name = data.doctor ? data.doctor.nickname : '';
                  $scope.pageConfig.doctor.department = data.doctor ? data.doctor.department_name : '';
                  $scope.pageConfig.doctor.on_shelf = data.doctor.on_shelf;
                  $scope.pageConfig.showButton = true;
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
          isOpen: false,//是否开启规则
          doctorSchedules: [],
          calendar: {
            dateItems: [{
              number: 1,
              weekName: '星期一'
            }, {
              number: 2,
              weekName: '星期二'
            }, {
              number: 3,
              weekName: '星期三'
            }, {
              number: 4,
              weekName: '星期四'
            }, {
              number: 5,
              weekName: '星期五'
            }, {
              number: 6,
              weekName: '星期六'
            }, {
              number: 7,
              weekName: '星期日'
            }],
            currentDateItem: null,
            beginIndex: 1,
            endIndex: 7,
            initBoard: function() {
              this.clickDate(this.dateItems[0]);
            },
            clickDate: function(dateItem) {
              if ($scope.pageConfig.calendar.currentDateItem) {
                $scope.pageConfig.calendar.currentDateItem.current = false;
              }
              dateItem.current = true;
              $scope.pageConfig.calendar.currentDateItem = dateItem;
              console.log(dateItem);
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

        $scope.addSettingRole = function() {
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


        $scope.upperShelf = function(){
          $scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您确定要上架吗？', callback: function (status) {
              $scope.$emit(GlobalEvent.onShowLoading, true);
              UserService.onShelfDoctor({doctor_id: $scope.pageConfig.doctorId}, function(err){
                $scope.$emit(GlobalEvent.onShowLoading, false);
                if(err){
                  return $scope.$emit(GlobalEvent.onShowAlert, err);
                }

                $scope.pageConfig.doctor.on_shelf = true;
                $scope.$emit(GlobalEvent.onShowAlert, '成功上架！');
              });
            }});
        };

        $scope.lowerShelf = function(doctor){
          $scope.$emit(GlobalEvent.onShowAlertConfirm, {content: '您确定要下架吗？', callback: function (status) {
              $scope.$emit(GlobalEvent.onShowLoading, true);
              UserService.offShelfDoctor({doctor_id: $scope.pageConfig.doctorId}, function(err){
                $scope.$emit(GlobalEvent.onShowLoading, false);
                if(err){
                  return $scope.$emit(GlobalEvent.onShowAlert, err);
                }

                $scope.pageConfig.doctor.on_shelf = false;
                $scope.$emit(GlobalEvent.onShowAlert, '成功下架！');
              });
            }});
        };


        function init() {
          $scope.pageConfig.calendar.initBoard(
              new Date(moment().format('YYYY/MM/DD')));
        }

        init();

      }]);
