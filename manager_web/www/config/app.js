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
      templateUrl: 'templates/management/user_index.client.view.html',
      controller: 'UserIndexController'
    })
    .state('department_list', {
      url: '/department/list',
      templateUrl: 'templates/department/list.client.view.html',
      controller: 'DepartmentListController'
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
