'use strict';

var gulp = require('gulp'),
  $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.rubySass({
      style: 'expanded'
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size());
});

gulp.task('scripts', function () {
  return gulp.src([
      'app/scripts/**/*.js',
      'test/**/*.js',
      'gulpfile.js',
      'protractor.conf.js',
      'karma.conf.js'
    ])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
  var jsFilter = $.filter('**/*.js'),
    cssFilter = $.filter('**/*.css');

  return gulp.src('app/**/*.html')
    .pipe($.useref.assets())
    .pipe(jsFilter)
    .pipe($.uglify())
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.csso())
    .pipe(cssFilter.restore())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'))
    .pipe($.size());
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size());
});

gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size());
});

gulp.task('clean', function () {
  return gulp.src(['.tmp', 'dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts']);

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('connect', function () {
  $.connect.server({
    root: ['app', '.tmp'],
    livereload: true
  });
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      directory: 'app/bower_components'
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'app/bower_components'
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', function () {
  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});


gulp.task('serve', ['connect', 'styles', 'watch'], function () {
  gulp.watch(['app/**/*', '.tmp/**/*'], function (event) {
    if (event.type === 'changed') {
      gulp.src(event.path).pipe($.connect.reload());
    }
  });
});

gulp.task('webdriver_update', $.protractor.webdriver_update);

gulp.task('test:e2e', ['webdriver_update', 'build'], function () {
  gulp.src(['test/e2e/**/*.spec.js'])
    .pipe($.protractor.protractor({
      configFile: 'protractor.conf.js',
      args: ['--baseUrl', 'http://127.0.0.1:8000']
    }))
    .on('error', function (e) { throw e; });
});

gulp.task('test:unit', function () {
  gulp.src([
    'app/bower_components/angular/angular.js',
    'app/bower_components/angular-route/angular-route.js',
    'app/bower_components/angular-mocks/angular-mocks.js',
    'app/scripts/main.js',
    'app/scripts/**/*.js',
    'test/unit/**/*.spec.js'
  ]).pipe($.karma({configFile: 'karma.conf.js'}));
});

gulp.task('test', ['test:e2e', 'test:unit']);