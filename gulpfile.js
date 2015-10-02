var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var sequence = require('gulp-sequence');

gulp.task('sass', function () {
  return gulp.src('src/style/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/style'));
});

gulp.task('sass:watch', function () {
  gulp.watch('src/style/**/*.scss', ['sass']);
});

gulp.task('build', sequence('clean', 'sass'));

gulp.task('clean', function () {
  return del(['dist/**/*']);
});
