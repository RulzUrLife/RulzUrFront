/*globals angular*/
'use strict';
angular.module('RulzUrFront', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/index.html',
        controller: 'indexCtrl'
      })
      .when('/new_recipe', {
        templateUrl: 'views/new_recipe.html',
        controller: 'newRecipeCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
