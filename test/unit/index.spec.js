/*globals angular, describe, beforeEach, it, expect*/
'use strict';
describe('RulzUrFront unit tests', function () {
  beforeEach(angular.mock.module('RulzUrFront'));

  describe('indexCtrl', function () {
    var scope;

    beforeEach(angular.mock.inject(function ($rootScope, $controller) {
      //create an empty scope
      scope = $rootScope.$new();
      //declare the controller and inject our empty scope
      $controller('indexCtrl', {$scope: scope});
    }));

    it('should have the correct message', function () {
      expect(scope.hello).toBe('Hello World!');
      expect(scope.hello).not.toBe('Whatever');
    });
  });
});