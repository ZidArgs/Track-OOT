"use strict";

const fs = require('fs');
const path = require("path");

const SRC_PATH = path.resolve(__dirname, "./src");
const DEV_PATH = path.resolve(__dirname, "./dev");
const PRD_PATH = path.resolve(__dirname, "./prod");
const EDT_PATH = path.resolve(__dirname, "./editor/content");

const MODULE_PATHS = {
    emcJS: path.resolve(__dirname, "node_modules/emcjs"),
    trackerEditor: path.resolve(__dirname, "node_modules/jseditors"),
    RTCClient: path.resolve(__dirname, "node_modules/rtcclient")
};

function fileExists(filename) {
    try {
        fs.accessSync(filename);
        return true;
    } catch (e) {
        return false;
    }
}

if (process.argv.indexOf('-nolocal') < 0) {
    let emcJS = path.resolve(__dirname, '../emcJS');
    if (fileExists(emcJS)) {
        MODULE_PATHS.emcJS = emcJS;
    }
    let trackerEditor = path.resolve(__dirname, '../JSEditors');
    if (fileExists(trackerEditor)) {
        MODULE_PATHS.trackerEditor = trackerEditor;
    }
    let RTCClient = path.resolve(__dirname, '../RTCClient');
    if (fileExists(RTCClient)) {
        MODULE_PATHS.RTCClient = RTCClient;
    }
}

const gulp = require("gulp");
const htmlmin = require('gulp-htmlmin');
const jsonminify = require('gulp-jsonminify');
const svgo = require('gulp-svgo');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');
const eslint = require('gulp-eslint');
const filemanager = require("./file-manager");

function copyHTML(dest = DEV_PATH) {
    return gulp.src(`${SRC_PATH}/**/*.html`)
        .pipe(filemanager.register(SRC_PATH, dest))
        .pipe(newer(dest))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(dest));
}

function copyJSON(dest = DEV_PATH) {
    if (process.argv.indexOf('-nocompress') < 0) {
        return gulp.src(`${SRC_PATH}/**/*.json`)
            .pipe(filemanager.register(SRC_PATH, dest))
            .pipe(newer(dest))
            .pipe(jsonminify())
            .pipe(gulp.dest(dest));
    } else {
        return gulp.src(`${SRC_PATH}/**/*.json`)
            .pipe(filemanager.register(SRC_PATH, dest))
            .pipe(newer(dest))
            .pipe(gulp.dest(dest));
    }
        
}

function copyI18N(dest = DEV_PATH) {
    return gulp.src(`${SRC_PATH}/i18n/*.lang`)
        .pipe(filemanager.register(`${SRC_PATH}/i18n`, `${dest}/i18n`))
        .pipe(newer(`${dest}/i18n`))
        .pipe(gulp.dest(`${dest}/i18n`));
}

function copyImg(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/images/**/*.svg`,
        `${SRC_PATH}/images/**/*.png`
    ];
    return gulp.src(FILES)
        .pipe(filemanager.register(`${SRC_PATH}/images`, `${dest}/images`))
        .pipe(newer(`${dest}/images`))
        .pipe(svgo())
        .pipe(gulp.dest(`${dest}/images`));
}

function copyChangelog(dest = DEV_PATH) {
    return gulp.src(`${SRC_PATH}/CHANGELOG.MD`)
        .pipe(filemanager.register(SRC_PATH, dest))
        .pipe(newer(dest))
        .pipe(gulp.dest(dest));
}

function copyCSS(dest = DEV_PATH) {
    return gulp.src(`${SRC_PATH}/style/**/*.css`)
        .pipe(filemanager.register(`${SRC_PATH}/style`, `${dest}/style`))
        .pipe(newer(`${dest}/style`))
        .pipe(autoprefixer())
        .pipe(gulp.dest(`${dest}/style`));
}

function copyFonts(dest = DEV_PATH) {
    const FILES = [
        `${SRC_PATH}/fonts/**/*.ttf`,
        `${SRC_PATH}/fonts/**/*.eot`,
        `${SRC_PATH}/fonts/**/*.otf`,
        `${SRC_PATH}/fonts/**/*.woff`,
        `${SRC_PATH}/fonts/**/*.woff2`,
        `${SRC_PATH}/fonts/**/*.svg`
    ];
    return gulp.src(FILES)
        .pipe(filemanager.register(`${SRC_PATH}/fonts`, `${dest}/fonts`))
        .pipe(newer(`${dest}/fonts`))
        .pipe(gulp.dest(`${dest}/fonts`));
}

function copyScript(dest = DEV_PATH) {
    return gulp.src(`${SRC_PATH}/script/**/*.js`)
        .pipe(filemanager.register(`${SRC_PATH}/script`, `${dest}/script`))
        .pipe(newer(`${dest}/script`))
        .pipe(gulp.dest(`${dest}/script`));
}

function copyEditorExtension(dest = DEV_PATH) {
    return gulp.src(`${EDT_PATH}/**/*.js`)
        .pipe(filemanager.register(`${EDT_PATH}`, `${dest}/script/content`))
        .pipe(newer(`${dest}/script/content`))
        .pipe(gulp.dest(`${dest}/script/content`));
}

function copyEmcJS(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.emcJS}/**/*.js`,
        `!${MODULE_PATHS.emcJS}/_demo/**/*.js`,
        `!${MODULE_PATHS.emcJS}/*.js`
    ];
    return gulp.src(FILES)
        .pipe(filemanager.register(MODULE_PATHS.emcJS, `${dest}/emcJS`))
        .pipe(newer(`${dest}/emcJS`))
        .pipe(gulp.dest(`${dest}/emcJS`));
}

function copyTrackerEditor(dest = DEV_PATH) {
    const FILES = [
        `${MODULE_PATHS.trackerEditor}/**/*.js`,
        `!${MODULE_PATHS.trackerEditor}/node_modules/**/*.js`,
        `!${MODULE_PATHS.trackerEditor}/*.js`,
        `${MODULE_PATHS.trackerEditor}/EditorChoice.js`
    ];
    return gulp.src(FILES)
        .pipe(filemanager.register(MODULE_PATHS.trackerEditor, `${dest}/editors`))
        .pipe(newer(`${dest}/editors`))
        .pipe(gulp.dest(`${dest}/editors`));
}

function copyRTCClient(dest = DEV_PATH) {
    return gulp.src(`${MODULE_PATHS.RTCClient}/**/*.js`)
        .pipe(filemanager.register(MODULE_PATHS.RTCClient, `${dest}/rtc`))
        .pipe(newer(`${dest}/rtc`))
        .pipe(gulp.dest(`${dest}/rtc`));
}

function copySW(dest = DEV_PATH) {
    return gulp.src(`${SRC_PATH}/sw.js`)
        .pipe(filemanager.register(SRC_PATH, dest))
        .pipe(newer(dest))
        .pipe(gulp.dest(dest));
}

function finish(dest = DEV_PATH, done) {
    filemanager.finish(dest);
    done();
}

exports.build = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, PRD_PATH),
        copyJSON.bind(this, PRD_PATH),
        copyI18N.bind(this, PRD_PATH),
        copyImg.bind(this, PRD_PATH),
        copyCSS.bind(this, PRD_PATH),
        copyFonts.bind(this, PRD_PATH),
        copyScript.bind(this, PRD_PATH),
        copyEditorExtension.bind(this, PRD_PATH),
        copyEmcJS.bind(this, PRD_PATH),
        copyTrackerEditor.bind(this, PRD_PATH),
        copyRTCClient.bind(this, PRD_PATH),
        copySW.bind(this, PRD_PATH),
        copyChangelog.bind(this, PRD_PATH)
    ),
    finish.bind(this, PRD_PATH)
);

exports.buildDev = gulp.series(
    gulp.parallel(
        copyHTML.bind(this, DEV_PATH),
        copyJSON.bind(this, DEV_PATH),
        copyI18N.bind(this, DEV_PATH),
        copyImg.bind(this, DEV_PATH),
        copyCSS.bind(this, DEV_PATH),
        copyFonts.bind(this, DEV_PATH),
        copyScript.bind(this, DEV_PATH),
        copyEditorExtension.bind(this, DEV_PATH),
        copyEmcJS.bind(this, DEV_PATH),
        copyTrackerEditor.bind(this, DEV_PATH),
        copyRTCClient.bind(this, DEV_PATH),
        copySW.bind(this, DEV_PATH),
        copyChangelog.bind(this, DEV_PATH)
    ),
    finish.bind(this, DEV_PATH)
);

exports.watch = function () {
    return gulp.watch(
        `${SRC_PATH}/**/*`,
        exports.build
    );
}

exports.eslint = function () {
    return gulp.src([`${SRC_PATH}/script/**/*.js`, `${MODULE_PATHS.emcJS}/**/*.js`])
        .pipe(eslint({
            "parserOptions": {
              "ecmaVersion": 2018,
              "sourceType": "module",
              "ecmaFeatures": {
                "jsx": false
              }
            },
            "env": {
              "browser": true,
              "es6": true
            },
            "rules": {
              "eqeqeq": "off"
            }
          }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}
