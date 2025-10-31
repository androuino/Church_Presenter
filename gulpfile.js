const gulp   = require('gulp'),
    terser   = require('gulp-terser'),
    concat   = require('gulp-concat'),
    cssmin   = require('gulp-cssmin'),
    sassGlob = require('gulp-sass-glob'),
    rename   = require('gulp-rename'),
    sass     = require('gulp-sass')(require('sass')),
    merge    = require('merge-stream'),
    usb      = require('usb'),
    maps   = require('gulp-sourcemaps');

const prefixLogin = "login";
const prefixUser = "user";
const paths = {
    // Private in:
    priv    : "resources/private/",
    jsrc    : ['jsrc/index.js', 'jsrc/control.js', 'jsrc/create.js', 'jsrc/settings.js', 'jsrc/wifisettings.js'],
    scss    : ['scss/index.scss', 'scss/control.scss', 'scss/create.scss', 'scss/settings.scss', 'scss/wifisettings.scss'],
    // Public out:
    pub     : "app/src/main/resources/public/",
    js      : 'js/',
    css     : 'css/',
}

gulp.task('js', gulp.series([], function() {
    const index = gulp.src([paths.priv + paths.jsrc[0]])
        .pipe(terser())
        .pipe(concat("index" + ".min.js"))
        .pipe(gulp.dest(paths.pub + paths.js));
    const control = gulp.src([paths.priv + paths.jsrc[1]])
        .pipe(terser())
        .pipe(concat("control" + ".min.js"))
        .pipe(gulp.dest(paths.pub + paths.js));
    const create = gulp.src([paths.priv + paths.jsrc[2]])
        .pipe(terser())
        .pipe(concat("create" + ".min.js"))
        .pipe(gulp.dest(paths.pub + paths.js));
    const settings = gulp.src([paths.priv + paths.jsrc[3]])
        .pipe(terser())
        .pipe(concat("settings" + ".min.js"))
        .pipe(gulp.dest(paths.pub + paths.js));
    const wifisettings = gulp.src([paths.priv + paths.jsrc[4]])
        .pipe(terser())
        .pipe(concat("wifisettings" + ".min.js"))
        .pipe(gulp.dest(paths.pub + paths.js));
    return merge([index, control, create, settings, wifisettings]);
}));
// CSS
gulp.task('css', gulp.series([], function () {
    const index = gulp.src([paths.priv + paths.scss[0]])
        .pipe(maps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({ extname : "" })) //remove extensions
        .pipe(rename({ extname : ".min.css" }))
        .pipe(maps.write("."))
        .pipe(gulp.dest(paths.pub + paths.css));
    const control = gulp.src([paths.priv + paths.scss[1]])
        .pipe(maps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({ extname : "" })) //remove extensions
        .pipe(rename({ extname : ".min.css" }))
        .pipe(maps.write("."))
        .pipe(gulp.dest(paths.pub + paths.css));
    const create = gulp.src([paths.priv + paths.scss[2]])
        .pipe(maps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({ extname : "" })) //remove extensions
        .pipe(rename({ extname : ".min.css" }))
        .pipe(maps.write("."))
        .pipe(gulp.dest(paths.pub + paths.css));
    const settings = gulp.src([paths.priv + paths.scss[3]])
        .pipe(maps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({ extname : "" })) //remove extensions
        .pipe(rename({ extname : ".min.css" }))
        .pipe(maps.write("."))
        .pipe(gulp.dest(paths.pub + paths.css));
    const wifisettings = gulp.src([paths.priv + paths.scss[4]])
        .pipe(maps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(cssmin())
        .pipe(rename({ extname : "" })) //remove extensions
        .pipe(rename({ extname : ".min.css" }))
        .pipe(maps.write("."))
        .pipe(gulp.dest(paths.pub + paths.css));
    return merge([index, control, create, settings, wifisettings]);
}));

// Build
gulp.task('default', gulp.series(['js','css']));
