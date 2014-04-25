/*globals describe, it, expect, element, browser*/
describe('RulzUrFront homepage', function () {
  'use strict';
  it('should display a welcome message', function () {
    browser.get('/');
    var hello = element({tagName: 'h1'});
    expect(hello.getText()).toEqual('Hello World!');
  });
});