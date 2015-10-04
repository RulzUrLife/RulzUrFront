var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var sequence = require('gulp-sequence');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var merge = require('merge2');

gulp.task('styles', function () {
  var sass_stream = gulp.src('src/style/**/*.scss')
    .pipe(sass().on('error', sass.logError));

  var normalize = gulp.src('node_modules/normalize.css/normalize.css');

  return merge(normalize, sass_stream)
    .pipe(sourcemaps.init())
    .pipe(concat('app.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/css'));

});

gulp.task('scripts', function () {
  return gulp.src('src/scripts/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('sass:watch', function () {
  gulp.watch('src/style/**/*.scss', ['styles']);
});

gulp.task('clean', function () {
  return del(['dist/**/*']);
});

gulp.task('test', function () {
  // do nothing...
});

gulp.task('build', sequence('clean', ['styles', 'scripts']));

