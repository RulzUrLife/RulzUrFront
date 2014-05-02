'use strict';

var gulp = require('gulp'),
  $ = require('gulp-load-plugins')(),
  paths = require('./conf').paths,
  wiredep = require('wiredep').stream;

gulp.task('sass', function () {
  return gulp.src(paths.sass)
    .pipe($.sass())
    .pipe($.autoprefixer('last 2 version', 'ios 6', 'android 4'))
    .pipe($.csslint('csslintrc.json'))
    .pipe($.csslint.reporter())
    .pipe(gulp.dest(paths.tmp + paths.styles))
    .pipe($.size());
});

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

gulp.task('build', ['sass', 'jshint', 'images', 'fonts', 'wiredep'],
  function () {
    var jsFilter = $.filter('**/*.js'),
      cssFilter = $.filter('**/*.css');

    return gulp.src(paths.dev + '/**/*.html')
      .pipe($.useref.assets())
      .pipe(jsFilter)
      .pipe($.uglify())
      .pipe(jsFilter.restore())
      .pipe(cssFilter)
      .pipe($.minifyCss())
      .pipe(cssFilter.restore())
      .pipe($.useref.restore())
      .pipe($.useref())
      .pipe(gulp.dest(paths.dist))
      .pipe($.size());
  });

gulp.task('images', function () {
  return gulp.src(paths.dev + paths.images + '/**/*')
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
    .pipe($.flatten())
    .pipe(gulp.dest(paths.dist + paths.fonts))
    .pipe($.size());
});

gulp.task('connect', function () {
  return $.connect.server({
    root: [ paths.dev, paths.tmp],
    livereload: true
  });
});

// inject bower components
gulp.task('wiredep:sass', function () {
  return gulp.src(paths.sass)
    .pipe(wiredep({
      directory: paths.bower_components
    }))
    .pipe(gulp.dest(paths.dev + paths.styles));
});

gulp.task('wiredep:html', function () {
  return gulp.src(paths.dev + '/*.html')
    .pipe(wiredep({
      directory: paths.bower_components
    }))
    .pipe(gulp.dest(paths.dev));
});

gulp.task('wiredep', ['wiredep:html', 'wiredep:sass']);

gulp.task('watch', function () {
  gulp.watch(paths.dev + paths.styles + '/**/*.scss', ['sass']);
  gulp.watch(paths.dev + paths.scripts +  '/**/*.js', ['jshint']);
  gulp.watch(paths.dev + paths.images + '/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});


gulp.task('serve', ['connect', 'sass', 'watch', 'wiredep'], function () {
  gulp.watch([paths.dev + '/**/*', paths.tmp + '/**/*'], function (event) {
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
