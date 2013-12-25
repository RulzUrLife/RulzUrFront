'use strict';

module.exports = function (grunt) {
  /*
   load-grunt-tasks avoid loading each task separatedly,
   the package.json file is parsed and each task matching grunt-* is loaded.
  */
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    app: {
      name: 'RulzUrFront',
      path: 'app'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= app.path %>/scripts/{,*/}*.js'
      ]
    }
  });
  grunt.registerTask('default', [
    'jshint'
  ]);
};
