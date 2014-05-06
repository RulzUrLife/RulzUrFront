/*globals angular*/
'use strict';
angular.module('RulzUrFront', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        controller: 'indexCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);