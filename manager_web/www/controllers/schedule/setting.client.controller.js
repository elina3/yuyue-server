'use strict';
angular.module('YYWeb').controller('ScheduleSettingController',
    ['$window', '$rootScope', '$scope', '$stateParams', 'GlobalEvent', '$state', 'UserService', 'Auth',
      function ($window, $rootScope, $scope, $stateParams, GlobalEvent, $state, UserService, Auth) {
        var user = Auth.getUser();
        if (!user) {
          $state.go('user_sign_in');
          return;
        }


        function loadDoctorSchedules(callback){
          $scope.pageConfig.doctorSchedules = [{
            id: '3',
            startTime: '8:00',
            endTime: '9:00',
            numberCount: 10,
            booked: 3
          }];
          return callback();
        }

        function getWeekName(date){
          var day = date.getDay();
          switch(day){
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

        $scope.pageConfig = {
          doctor: {
            name: '刘医生'
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
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月',
                  '十月', '十一月', '十二月']
              },
              timePicker: false,
              timePicker12Hour: false,
              timePickerIncrement: 1,
              singleDatePicker: true,
              separator: ' ~ ',
              format: 'YYYY月MM日DD'
            },
            getCurrentDate: function(){
              if (this.createTimeRange.startDate && this.createTimeRange.startDate._d) {
                var time = moment(this.createTimeRange.startDate);
                return new Date(time);
              }
              return null; 
            }
          },
          changeDate: function(){
            this.calendar.initBoard(this.datePicker.getCurrentDate());
          },
          calendar: {
            dateItems: [],
            currentDateItem: null,
            beginIndex: 1,
            endIndex: 7,
            initBoard: function(date){
              var yesterday = new Date((date.getTime() - 24*60*60*1000));
              console.log('yesterday',yesterday);
              console.log(date);
              this.dateItems = [];
              this.dateItems.push({date: yesterday, number: yesterday.Format('MM月dd日'), weekName: getWeekName(yesterday), show: false});
              this.dateItems.push({date: date, number: date.Format('MM月dd日'), weekName: getWeekName(date), show: true});
              for(var i=1; i <= 58; i++){
                var currentDate = new Date(date.getTime() + i * 24 * 60 *60 * 1000);
                
                this.dateItems.push({
                  date: currentDate,
                  number: currentDate.Format('MM月dd日'),
                  weekName: getWeekName(currentDate),
                  show: i <= 6
                });
              }
              this.clickDate(this.dateItems[1]);
            },
            prevDate: function(){
              var prevDateItem = this.dateItems[this.beginIndex - 1];
              if(prevDateItem){
                this.dateItems[this.endIndex].show = false;
                prevDateItem.show = true;
                this.beginIndex -= 1;
                this.endIndex -= 1;
              }
            },
            nextDate: function(){
              var nextDateItem = this.dateItems[this.endIndex + 1];
              if(nextDateItem){
                this.dateItems[this.beginIndex].show = false;
                nextDateItem.show = true;
                this.beginIndex += 1;
                this.endIndex += 1;
              }
            },
            clickDate: function(dateItem){
              if($scope.pageConfig.calendar.currentDateItem){
                $scope.pageConfig.calendar.currentDateItem.current = false;
              }
              dateItem.current = true;
              $scope.pageConfig.calendar.currentDateItem = dateItem;
            }
          },
          popBox: {
            show: false,
            dateString: '',
            inputNumber: 0,
            startTime: {
              hour: 8,
              minute: 30
            },
            endTime: {
              hour: 9,
              minute: 30
            },
            currentSchedule: null,
            reset: function(){
              this.currentSchedule = null;
              this.inputNumber = 0;
              this.startTime = {
                hour: 8,
                minute: 30
              };
              this.endTime = {
                hour: 9,
                minute: 30
              };
            },
            open: function(schedule){
              console.log('open',$scope.pageConfig.calendar.currentDateItem.number);
              this.dateString = $scope.pageConfig.calendar.currentDateItem.number;
              if(schedule){
                this.inputNumber = schedule.numberCount;
                this.currentSchedule = schedule;
                this.startTime.hour = schedule.startTime.split(':')[0];
                this.startTime.minute = schedule.startTime.split(':')[1];
                this.endTime.hour = schedule.endTime.split(':')[0];
                this.endTime.minute = schedule.endTime.split(':')[1];
              }
              this.show = true;
            },
            sure: function(){
              if(this.inputNumber === 0){
                $scope.$emit(GlobalEvent.onShowAlert, '号源数量至少设置为1！');
                return;
              }

              if(this.endTime.hour < this.startTime.hour){
                $scope.$emit(GlobalEvent.onShowAlert, '结束时间大于开始时间！');
                return;
              }

              if(this.endTime.hour === this.startTime.hour && this.endTime.minute <= this.startTime.minute){
                $scope.$emit(GlobalEvent.onShowAlert, '结束时间大于开始时间！');
                return;
              }

              if(this.currentSchedule){
                this.currentSchedule.numberCount = this.inputNumber;
                this.currentSchedule.startTime = this.startTime.hour + ':' + this.endTime.minute;
                this.currentSchedule.endTime = this.endTime.hour + ':' + this.endTime.minute;
                //todo 更新
              }else{
                console.log('请求保存');
              //todo 请求保存
                // $scope.pageConfig.doctorSchedules.push({

                // });
              }
              this.show = false;
              this.reset();
            },
            cancel: function(){
              this.show = false;
              this.reset();
            }
          }
        };

        $scope.addDoctorSchedule = function(){
          $scope.pageConfig.popBox.open();
        };


        function init() {
          console.log('params.id:', $stateParams.id);

          $scope.pageConfig.calendar.initBoard(new Date(moment().format('YYYY/MM/DD')));

          $scope.$emit(GlobalEvent.onShowLoading, true);
          loadDoctorSchedules(()=>{
            $scope.$emit(GlobalEvent.onShowLoading, false);
          });
        }

        init();
      }]);
