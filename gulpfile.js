'use strict';

var gulp           = require('gulp'),
  $                = require('gulp-load-plugins')(),
  config           = require('./config'),
  wiredep          = require('wiredep').stream,
  bower            = require('bower'),
  rimraf           = require('rimraf'),
  isDist           = $.util.env.type === 'dist',
  wiredepConf      = isDist ? config.wiredep.dist: config.wiredep.dev,
  dest             = isDist ? config.dist : config.tmp;


gulp.task('jshint', function () {
  return gulp.src([
    config.dev.scripts,
    config.test.unit,
    config.test.e2e,
    config.gulpfile,
    config.protractor_conf,
    config.karma_conf
  ])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('copy', function () {
  gulp.src(config.dev.others)
    .pipe(gulp.dest(dest.path));
});

gulp.task('useref', function () {
  var jsFilter = $.filter('**/*.js');
  return gulp.src(config.dev.html)
    .pipe(wiredep(wiredepConf))
    .pipe($.useref.assets())
    .pipe(jsFilter)
    .pipe(isDist ? $.uglify(): $.util.noop())
    .pipe(jsFilter.restore())
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest(dest.path));
});


gulp.task('images', function () {
  return gulp.src(config.dev.images)
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(dest.images));
});

gulp.task('fonts', function () {
  var fs = require('fs');

  return gulp.src(
    fs.readdirSync(config.bower_components).map(
      function (dir) {
        return config.bower_components + '/' + dir + '/**/*.{eot,svg,ttf,woff}';
      }))
    .pipe(gulp.dest(dest.styles));
});


function connect(root, livereload, port) {
  return $.connect.server({
    root: root,
    livereload: livereload,
    port: port
  });
}

gulp.task('connect', function () {
  return connect(dest.path, true, config.connect.port);
});

gulp.task('connect:test', function () {
  return connect(dest.path, false, config.connect.test_port);
});

gulp.task('reloadScripts', ['useref'], function () {
  return gulp.src(dest.scripts)
    .pipe($.connect.reload());
});

gulp.task('reloadImages', ['images'], function () {
  gulp.src(dest.images + '/**')
    .pipe($.connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(config.dev.scripts, ['reloadScripts']);
  gulp.watch(config.dev.images, ['reloadImages']);
});


gulp.task('test:e2e', ['build', 'connect:test'], function (cb) {
  var child = require('child_process').execFile(
    require('phantomjs').path,
    ['--webdriver=9515']
  );

  child.stdout.on('data', function (chunk) {
    if (chunk.indexOf('GhostDriver') > -1 && chunk.indexOf('running') > -1) {
      gulp.src(config.test.e2e)
        .pipe($.protractor.protractor({
          configFile: config.protractor_conf,
          args: ['--baseUrl', 'http://localhost:' + config.connect.test_port]
        }))
        .on('error', function (e) {
          child.kill();
          throw e;
        })
        .on('end', function () {
          child.kill();
          $.connect.serverClose();
          cb();
        });
    }
  });
});

gulp.task('test:unit', function () {
  var wiredep = require('wiredep')({
    directory: config.bower_components,
    dependencies: true,    // default: true
    devDependencies: true  // default: false
  });
  wiredep.js.push(
    config.dev.scripts,
    config.test.unit
  );
  return gulp.src(wiredep.js)
    .pipe($.karma({configFile: config.karma_conf}));
});


gulp.task('clean', function () {
  rimraf.sync(config.tmp.path);
  rimraf.sync(config.dist.path);
});

gulp.task('build', function () {
  /*
   TODO: hack for clean, has to be fix in gulp 4 see:
   https://www.npmjs.org/package/run-sequence
   */
  var runSequence = require('run-sequence');
  runSequence('clean', ['copy', 'useref', 'jshint', 'images', 'fonts']);
});

gulp.task('serve', ['build', 'watch', 'connect']);
gulp.task('test', ['test:unit', 'test:e2e']);
