var gulp = require('gulp');
var scsslint = require('gulp-scss-lint');
var eslint = require('gulp-eslint');
var svgmin = require('gulp-svgmin');
var jscs = require('gulp-jscs');

/*
 * Create variables for our project paths so we can change in one place
 */
var paths = {
  svgSrc: ['./public/images/**/*.svg'],
  jsSrc: ['./models/**/*.js', './routes/**/*.js', 'keystone.js', 'package.json'],
  scssSrc: ['./public/styles/**/*.scss', '!./public/styles/bootstrap/**/*.scss', '!./public/styles/font-awesome/**/*.scss']
};

gulp.task('svgmin', function () {
  return gulp.src(paths.svgSrc, {
          base: './'
        })
        .pipe(svgmin())
        .pipe(gulp.dest('./'));
});

gulp.task('lint-js', function () {
  gulp.src(paths.jsSrc)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('lint-scss', function () {
  gulp.src(paths.scssSrc)
    .pipe(scsslint({
      config: './.scss-lint.yml'
    }));
});

gulp.task('codestyle', function () {
  gulp.src(paths.jsSrc)
    .pipe(jscs({
      configPath: './.jscsrc'
    }))
    .pipe(jscs.reporter());
});

gulp.task('watch', function () {
  gulp.watch(paths.jsSrc.concat(paths.scssSrc), ['lint-js', 'lint-scss', 'codestyle']);
});
