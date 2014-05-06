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

function build(dist) {

  var jsFilter = $.filter('**/*.js'),
    wiredepDev = { directory: paths.bower_components},
    wiredepDist = {
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
            'dessert.min.css',
            'fonts/**/*.{eot,svg,ttf,woff}'
          ]
        }
      }
    },
    wiredepConf = dist ? wiredepDist: wiredepDev,
    gulpTask = gulp.src(paths.dev + '/**/*.html')
      .pipe(wiredep(wiredepConf))
      .pipe($.useref.assets());

  if (dist) {
    gulpTask.pipe(jsFilter)
      .pipe($.uglify())
      .pipe(jsFilter.restore());
  }

  return gulpTask
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest(paths.build))
    .pipe($.size());
}

gulp.task('build:dist', ['jshint', 'images', 'fonts'], function () {
    return build(true);
  });

gulp.task('build:dev', ['jshint', 'images', 'fonts'], function () {
    return build(false);
  });

gulp.task('images', function () {
  return gulp.src(paths.dev + paths.images + '/**')
    .pipe($.cache($.imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(paths.build + paths.images))
    .pipe($.size());
});

gulp.task('fonts', function () {
  return $.bowerFiles()
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.rename(function (path) {
      path.dirname = path.dirname.slice(path.dirname.indexOf('/') + 1);
    }))
    .pipe(gulp.dest(paths.build + '/styles'))
    .pipe($.size());
});

gulp.task('connect', function () {
  return $.connect.server({
    root: [paths.build],
    livereload: true
  });
});

gulp.task('reload', ['build:dev'], function () {
  gulp.src(paths.build).pipe($.connect.reload());
});

gulp.task('watch', function () {
  gulp.watch([paths.dev + '/**'], ['build:dev', 'reload']);
});


gulp.task('serve', ['connect', 'watch', 'build:dev']);

gulp.task('test:e2e', ['build:dist'], function (cb) {
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
  return gulp.src([paths.build], { read: false }).pipe($.clean());
});

gulp.task('default', ['clean'], function () {
  gulp.start('test');
});
