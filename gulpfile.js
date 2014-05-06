'use strict';

var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  paths = require('./conf').paths,
  wiredep = require('wiredep').stream;

gulp.task('jshint', function () {
  return gulp.src([
      paths.dev + paths.scripts + '/**/*.js',
      paths.test_unit + '/**/*.js',
      paths.test_e2e + '/**/*.js',
      paths.protractor_conf,
      paths.karma_conf,
      'gulpfile.js'
    ])
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['jshint', 'images', 'fonts'],
  function () {
    var jsFilter = $.filter('**/*.js'),
    indexFilter = $.filter('index.html');

    return gulp.src(paths.dev + '/**/*.html')
      .pipe(indexFilter)
      .pipe(wiredep({
        directory: paths.bower_components,
        overrides: {
          angular: {
            main: 'angular.min.js'
          },
          'angular-route': {
            main: 'angular-route.min.js'
          },
          'dessert': {
            main: [
              "dessert.min.css",
              "fonts/Regular/OpenSans-Regular.eot",
              "fonts/Regular/OpenSans-Regular.svg",
              "fonts/Regular/OpenSans-Regular.ttf",
              "fonts/Regular/OpenSans-Regular.woff",
              "fonts/Semibold/OpenSans-Semibold.eot",
              "fonts/Semibold/OpenSans-Semibold.svg",
              "fonts/Semibold/OpenSans-Semibold.ttf",
              "fonts/Semibold/OpenSans-Semibold.woff"
            ]
          }
        }
      }))
      .pipe($.useref.assets())
      .pipe(jsFilter)
      .pipe($.uglify())
      .pipe(jsFilter.restore())
      .pipe($.useref.restore())
      .pipe($.useref())
      .pipe(indexFilter.restore())
      .pipe(gulp.dest(paths.dist))
      .pipe($.size());
  });

gulp.task('images', function () {
  return gulp.src(paths.dev + paths.images + '/**')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(paths.dist + paths.images))
    .pipe($.size());
});

gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.rename(function (path) {
      path.dirname = path.dirname.slice(path.dirname.indexOf('/') + 1);
    }))
    .pipe(gulp.dest(paths.dist + '/styles'))
    .pipe($.size());
});

gulp.task('connect', function () {
  return $.connect.server({
    root: [paths.tmp, paths.dev],
    livereload: true
  });
});

// inject bower components
gulp.task('wiredep', function () {
  return gulp.src(paths.dev + '/*.html')
    .pipe(wiredep({directory: paths.bower_components}))
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('watch', function () {
  gulp.watch(paths.dev + paths.scripts +  '/**/*.js', ['jshint']);
  gulp.watch(paths.dev + paths.images + '/**', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});


gulp.task('serve', ['connect', 'watch', 'wiredep'], function () {
  gulp.watch([paths.dev + '/**/*', paths.tmp + '/**'], function (event) {
    if (event.type === 'changed') {
      gulp.src(event.path).pipe($.connect.reload());
    }
  });
});

gulp.task('test:e2e', ['build'], function (cb) {
  var child = require('child_process').execFile(
    require('phantomjs').path,
    ['--webdriver=9515']
  );

  child.stdout.on('data', function (chunk) {
    if (chunk.indexOf('GhostDriver') > -1 && chunk.indexOf('running') > -1) {
      gulp.src([paths.test_e2e + '/**/*.spec.js'])
        .pipe($.protractor.protractor({
          configFile: paths.protractor_conf,
          args: ['--baseUrl', 'http://127.0.0.1:8000']
        }))
        .on('error', function (e) { cb(e); })
        .on('end', function () {
          child.kill();
          cb();
        });
    }
  });
});

gulp.task('test:unit', function () {
  var wiredep = require('wiredep')({
    directory: paths.bower_components,
    dependencies: true,    // default: true
    devDependencies: true  // default: false
  });
  wiredep.js.push(
    paths.dev + paths.scripts + '/**/*.js',
    paths.test_unit + '/**/*.spec.js'
  );
  return gulp.src(wiredep.js).pipe($.karma({configFile: paths.karma_conf}));
});

gulp.task('test', ['test:unit', 'test:e2e']);

gulp.task('clean', function () {
  return gulp.src([paths.tmp, paths.dist], { read: false }).pipe($.clean());
});

gulp.task('default', ['clean'], function () {
  gulp.start('test');
});
