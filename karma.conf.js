'use strict';
module.exports = function (config) {
  config.set({

    frameworks: ['jasmine'],
    reporters: ['progress'],
    port: 9876,
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
    // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    browsers: ['Chrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    autoWatch: false,
    singleRun: true
  });
};
