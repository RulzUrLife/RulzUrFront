/*globals jasmine*/
'use strict';

exports.config = {
  // The address of a running selenium server.
  seleniumServerJar:
    './node_modules/protractor/selenium/selenium-server-standalone-2.41.0.jar',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  framework: 'jasmine',

  onPrepare: function () {
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      new jasmine.JUnitXmlReporter('test/report/', true, true));

    //starts an http server for testing the frontend
    var connect = require('connect');

    connect()
      .use(connect.static('dist'))
      .listen(8000);
  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }

};
