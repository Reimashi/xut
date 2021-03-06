var gulp = require('gulp');

gulp.task('test-server', function() {
    var http = require('http');
    var express = require('express');
    var app = express();

    app.use(express.static('build'));

    var server = app.listen(80, function () {
      console.log('Test server listening at http://%s:%s', server.address().address, server.address().port);
    });
});

gulp.task('download-deps', function (callback) {
  var tsd = require('gulp-tsd');
  tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});

var compileTypescript = function(scriptname, projectdir) {
    var ts = require('gulp-typescript');
    var concat = require('gulp-concat');
    var sourcemaps = require('gulp-sourcemaps');

    var tsProject = ts.createProject(projectdir + '/tsconfig.json');

    var tsresult = tsProject.src(projectdir + '/**/*.ts')
         .pipe(sourcemaps.init())
         .pipe(ts(tsProject));

    return tsresult.js
        .pipe(concat(scriptname))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build'));
}

var compileJavascript = function(scriptname, projectdir) {
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

    gulp.src(projectdir + '/**/*.js')
        //.pipe(uglify())
        .pipe(concat(scriptname))
        .pipe(gulp.dest('build'));
}

gulp.task('compilets-script', function () {
  compileTypescript("xut.js", 'script');
});

gulp.watch('script/**/*.ts', ['compilets-script']);

gulp.task('compilejs-angular', function () {
  compileJavascript("xut-angular.js", 'webapp/angular');
});

gulp.watch('webapp/angular/**/*.js', ['compilejs-angular']);

gulp.task('compilehtml', function() {
  var swig = require('gulp-swig');
  var htmlmin = require('gulp-htmlmin');

  gulp.src('webapp/views/index.html')
    .pipe(swig({ defaults: { cache: false}}))
    /*.pipe(htmlmin({
      collapseWhitespace: true
    }))*/
    .pipe(gulp.dest('build'))
});

gulp.watch('webapp/views/**/*.html', ['compilehtml']);

gulp.task('default', ['test-server', 'compilets-script', 'compilejs-angular', 'compilehtml']);
