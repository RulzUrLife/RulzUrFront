/*globals jasmine*/
'use strict';

exports.config = {
  // The address of a running selenium server.
  seleniumAddress: 'http://localhost:9515',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'phantomjs'
  },

  framework: 'jasmine',

  onPrepare: function () {
    require('jasmine-reporters');
    jasmine.getEnv().addReporter(
      new jasmine.JUnitXmlReporter('test/report/', true, true));
  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
