// grab gulp packages
var gulp = require("gulp");
var gutil = require("gulp-util");

var changed = require("gulp-changed");
var minifyHtml = require("gulp-minify-html");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var sass = require("gulp-sass");
var cleanCss = require("gulp-clean-css");
var ngAnnotate = require("gulp-ng-annotate");
var sourcemaps = require("gulp-sourcemaps");

// minify new or changed HTML pages
gulp.task("htmlpage", function() {
    var htmlSrc = "./public/views/**/*.html";
    var htmlDst = "./build/views";

    gulp.src(htmlSrc)
        .pipe(changed(htmlDst))
        .pipe(minifyHtml())
        .pipe(gulp.dest(htmlDst));
});

// JS concat and minify
gulp.task("scripts", function() {
   gulp.src(["./public/js/**/*.js"])
       .pipe(sourcemaps.init())
            .pipe(concat("script.js"))
            .pipe(ngAnnotate().on('error', gutil.log))
            .pipe(uglify().on('error', gutil.log))
       .pipe(sourcemaps.write())
       .pipe(gulp.dest("./build/scripts/"));
});

// SASS compilation and minify
gulp.task("styles", function() {
   gulp.src(["./public/sass/**/*.scss"])
       .pipe(concat('styles.scss'))
       .pipe(sass().on('error', sass.logError))
       .pipe(cleanCss())
       .pipe(gulp.dest("./build/styles/"));
});

// default task
gulp.task("default", ["htmlpage", "scripts", "styles"], function() {
    var html = ["htmlpage"];
    var js = ["scripts"];
    var css = ["styles"];

    // watch for HTML changes
    gulp.watch("./public/views/**/*.html", html);

    // watch for JS changes
    gulp.watch("./public/js/**/*.js", js);

    // watch for SCSS changes
    gulp.watch("./public/sass/**/*.scss", css);
});