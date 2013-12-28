'use strict';

module.exports = function (grunt) {
  /*
   load-grunt-tasks avoid loading each task separatedly,
   the package.json file is parsed and each task matching grunt-* is loaded.
  */
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

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
    watch: {
      compass: {
        files: ['<%= app.dev %>/styles/{,*/}*.{scss,sass}'],
        tasks: ['compass:server', 'autoprefixer']
      },
      styles: {
        files: ['<%= app.dev %>/styles/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= app.dev %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '{.tmp,<%= app.dev %>}/scripts/{,*/}*.js',
          '<%= app.dev %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },
    phantom: {
      test: {
        options: {
          port: 9515
        }
      }
    },
    protractor: {
      test: {
        configFile: 'protractor-config.js', // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false // If true, protractor will not use colors in its output.
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= app.dev %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= app.dist %>/images'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= app.dev %>/images',
          src: '{,*/}*.svg',
          dest: '<%= app.dist %>/images'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        hostname: '0.0.0.0',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          base: [
            '.tmp',
            '<%= app.dev %>'
          ]
        }
      },
      dist: {
        options: {
          base: '<%= app.dist %>'
        }
      },
      test: {
        options: {
          port: 9001,
          base: [
            '.tmp',
            'test',
            '<%= app.dev %>'
          ]
        }
      }
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
      },
      server: '.tmp'
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/styles/',
          src: '{,*/}*.css',
          dest: '.tmp/styles/'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= app.dev %>',
          dest: '<%= app.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.{gif,webp}',
            'styles/fonts/*'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= app.dist %>/images',
          src: [
            'generated/*'
          ]
        }]
      },
      styles: {
        expand: true,
        cwd: '<%= app.dev %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= app.dist %>/scripts/{,*/}*.js',
            '<%= app.dist %>/styles/{,*/}*.css',
            '<%= app.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= app.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    compass: {
      options: {
        sassDir: '<%= app.dev %>/styles',
        cssDir: '.tmp/styles',
        generatedImagesDir: '.tmp/images/generated',
        imagesDir: '<%= app.dev %>/images',
        javascriptsDir: '<%= app.dev %>/scripts',
        fontsDir: '<%= app.dev %>/styles/fonts',
        httpImagesPath: '/images',
        httpGeneratedImagesPath: '/images/generated',
        httpFontsPath: '/styles/fonts',
        relativeAssets: false
      },
      dist: {},
      server: {
        options: {
          debugInfo: true
        }
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
    htmlrefs: {
      dist: {
        src: '<%= app.dist %>/index.html'
      }
    },
    htmlmin: {
      copy: {
        files: [{
          expand: true,
          cwd: '<%= app.dev %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= app.dist %>'
        }]
      },
      compress: {
        options: {
          removeCommentsFromCDATA: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: '<%= app.dist %>',
          src: '{,*/}*.html',
          dest: '<%= app.dist %>'
        }]
      }
    },
    concurrent: {
      server: [
        'compass:server',
        'copy:styles'
      ],
      test: [
        'compass',
        'copy:styles'
      ],
      dist: [
        'compass:dist',
        'copy:styles',
        'imagemin',
        'svgmin',
        'htmlmin:copy'
      ]
    },
    uglify: {
      dist: {
        files: {
          '<%= app.dist %>/scripts/scripts.js': [
            '<%= app.dist %>/scripts/scripts.js'
          ]
        }
      }
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'clean:server',
    'concurrent:test',
    'autoprefixer',
    'connect:test',
    'phantom',
    'protractor'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    'htmlrefs',
    'cssmin',
    'uglify',
    'rev',
    'usemin',
    'htmlmin:compress'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'test',
    'build'
  ]);
};
