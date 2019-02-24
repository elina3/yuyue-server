'use strict';
/**
 * Created by louisha on 15/9/24.
 */
var yyWeb = angular.module('YYWeb', [
  'ui.router',
  'ngAnimate',
  'ngMessages',
  'LocalStorageModule',
  'base64',
  'daterangepicker'
]);

yyWeb.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('user_sign_in', {
      url: '/user/sign_in',
      templateUrl: 'templates/user/sign_in.client.view.html',
      controller: 'UserSignInController'
    })
    .state('user_manager', {
      url: '/user/manager:panel_type',
      templateUrl: 'templates/user/user_manager.client.view.html',
      controller: 'UserManagerController'
    })
    .state('user_index', {
      url: '/user/index',
      templateUrl: 'templates/appointment/list.client.view.html',
      controller: 'AppointmentListController'
    })
    .state('user_list', {
      url: '/user/list',
      templateUrl: 'templates/user/list.client.view.html',
      controller: 'UserListController'
    })
    .state('user_detail', {
      url: '/user/detail:id',
      templateUrl: 'templates/user/detail.client.view.html',
      controller: 'UserDetailController'
    })
    .state('user_add', {
      url: '/user/add',
      templateUrl: 'templates/user/add.client.view.html',
      controller: 'UserAddController'
    })
    .state('appointment_detail', {
      url: '/appointment/detail:id',
      templateUrl: 'templates/appointment/detail.client.view.html',
      controller: 'AppointmentDetailController'
    })
   .state('department_list', {
      url: '/department/list',
      templateUrl: 'templates/department/list.client.view.html',
      controller: 'DepartmentListController'
    })
   .state('department_add', {
      url: '/department/add',
      templateUrl: 'templates/department/add.client.view.html',
      controller: 'DepartmentAddController'
    })
   .state('department_detail', {
      url: '/department/detail:id',
      templateUrl: 'templates/department/detail.client.view.html',
      controller: 'DepartmentDetailController'
    })
   .state('job_title_list', {
      url: '/job_title/list',
      templateUrl: 'templates/job_title/list.client.view.html',
      controller: 'JobTitleListController'
    })
   .state('job_title_add', {
      url: '/job_title/add',
      templateUrl: 'templates/job_title/add.client.view.html',
      controller: 'JobTitleAddController'
    })
   .state('job_title_detail', {
      url: '/job_title/detail:id',
      templateUrl: 'templates/job_title/detail.client.view.html',
      controller: 'JobTitleDetailController'
    })
   .state('pay_list', {
      url: '/pay/list',
      templateUrl: 'templates/pay/list.client.view.html',
      controller: 'PayListController'
    })
   .state('pay_detail', {
      url: '/pay/detail:id',
      templateUrl: 'templates/pay/detail.client.view.html',
      controller: 'PayDetailController'
    })
   .state('sicker_list', {
      url: '/sicker/list',
      templateUrl: 'templates/sicker/list.client.view.html',
      controller: 'SickerListController'
    })
   .state('sicker_detail', {
      url: '/sicker/detail:id',
      templateUrl: 'templates/sicker/detail.client.view.html',
      controller: 'SickerDetailController'
    })
   .state('schedule_list', {
      url: '/schedule/list',
      templateUrl: 'templates/schedule/list.client.view.html',
      controller: 'ScheduleListController'
    })
   .state('schedule_setting', {
      url: '/schedule/setting/:id',
      templateUrl: 'templates/schedule/setting.client.view.html',
      controller: 'ScheduleSettingController'
    });

  $urlRouterProvider.otherwise('/user/sign_in');
}]);

yyWeb.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.interceptors.push('PublicInterceptor');

  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */
  var param = function (obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if (value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }
    return query.length ? query.substr(0, query.length - 1) : query;
  };

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function (data) {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
}]);
