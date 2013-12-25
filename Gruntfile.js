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
      dev: 'app',
      dist: 'dist'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= app.dev %>/scripts/{,*/}*.js'
      ]
    },
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= app.dist %>/*'
          ]
        }]
      }
    },
    copy: {
      styles: {
        expand: true,
        cwd: '<%= app.dev %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    useminPrepare: {
      html: '<%= app.dev %>/index.html',
      options: {
        dest: '<%= app.dist %>'
      }
    },
    usemin: {
      html: ['<%= app.dist %>/{,*/}*.html'],
      css: ['<%= app.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= app.dist %>']
      }
    },
    htmlmin: {
      dist: {
        options: {
          removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= app.dev %>',
          src: ['*.html'],
          dest: '<%= app.dist %>'
        }]
      }
    }

  });

  grunt.registerTask('default', [
    'jshint',
    'clean:dist',
    'useminPrepare',
    'copy:styles',
    'concat',
    'cssmin',
    'uglify',
    'htmlmin',
    'usemin'

  ]);
};
