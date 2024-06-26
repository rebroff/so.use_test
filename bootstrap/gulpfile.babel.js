import gulp from 'gulp';
import plugins from 'gulp-load-plugins';
import rimraf from 'rimraf';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import browser from 'browser-sync';
import browserify from 'browserify';
import esmify from 'esmify';
import gulpif from 'gulp-if';
import imagemin from 'gulp-imagemin';
import gulpSass from 'gulp-sass';
import nodeSass from 'sass';
import insert from 'gulp-insert';
import formatHTML from 'gulp-format-html';
import removeEmptyLines from 'gulp-remove-empty-lines';
import size from 'gulp-size';
import cached from 'gulp-cached';

const sass = gulpSass(nodeSass);
const mode = require('gulp-mode')();
const rename = require("gulp-rename");
const $ = plugins();

// Paths
const paths = {
  src: {
    root: 'src/',
    templates: 'src/templates/*.html',
    styles: 'src/scss/app.scss',
    scripts: 'src/js/app.js',
    images: 'src/images/**/*',
  },
  dist: {
    root: 'dist/',
    templates: 'dist/',
    styles: 'dist/css/',
    scripts: 'dist/js/',
    images: 'dist/images/'
  },
  public: {
    root: 'public/',
    templates: 'public/',
    styles: 'public/css/',
    scripts: 'public/js/',
    images: 'public/images/'
  },
  watch: {
    templates: 'src/templates/*.html',
    styles: 'src/scss/**/*.scss',
    scripts: 'src/js/**/*.js',
    images: 'src/images/**/*'
  },
};

const processMode = (process.env.PROCESS_MODE = mode.production()
  ? 'production'
  : 'development');
process.env.PROCESS_TIME = new Date().toLocaleString();
process.env.PROCESS_TIMESTAMP = Date.now();

// Delete dist or public folder
function clean(done) {
  if (processMode === 'production') {
    rimraf('public', done);
  } else {
    rimraf('dist', done);
  }
}

// Templates
function templates() {
  return processMode === 'production'
    ? gulp
      .src(paths.src.templates)
      .pipe(insert.transform(function(contents, file) {
        return contents.replace(`</head>`, `<link rel="stylesheet" href="css/style.min.css?v=${Date.now()}"/></head>`);
      }))
      .pipe(insert.transform(function(contents, file) {
        return contents.replace(`<!-- bundle.js -->`, `<script src="js/bundle.min.js?v=${Date.now()}"/></script>`);
      }))
      .pipe(removeEmptyLines())
      .pipe(formatHTML())
      .pipe(gulp.dest(paths.public.templates))
    : gulp
      .src(paths.src.templates)
      .pipe(cached('html'))
      .pipe(insert.transform(function(contents, file) {
        return contents.replace(`</head>`, `<link rel="stylesheet" href="css/style.css?v=${Date.now()}"/></head>`);
      }))
      .pipe(insert.transform(function(contents, file) {
        return contents.replace(`<!-- bundle.js -->`, `<script src="js/bundle.js?v=${Date.now()}"></script>`);
      }))
      .pipe(removeEmptyLines())
      .pipe(formatHTML())
      .pipe(rename({
        dirname: ''
      }))
      .pipe(gulp.dest(paths.dist.templates));
}


// Styles
function styles() {
  return processMode === 'production'
    ? gulp
        .src(paths.src.styles)
        .pipe($.plumber())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe($.rename('style.min.css'))
        .pipe($.autoprefixer())
        .pipe(size())
        .pipe(gulp.dest(paths.public.styles))
    : gulp
        .src(paths.src.styles)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe($.rename('style.css'))
        .pipe($.autoprefixer())
        .pipe(insert.prepend(`/* Built at: ${process.env.PROCESS_TIME} */\n\n`))
        .pipe($.sourcemaps.write('./'))
        .pipe(size())
        .pipe(gulp.dest(paths.dist.styles));
}

// Scripts
function scripts() {
  return processMode === 'development'
    ? browserify({
        entries: [paths.src.scripts],
        debug: true,
        plugin: [[esmify]],
      })
        .bundle()
        .pipe($.plumber())
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe($.sourcemaps.init({ loadMaps: true }))
        .pipe($.sourcemaps.write('./'))
        .pipe(insert.prepend(`/* Built at: ${process.env.PROCESS_TIME} */\n\n`))
        .pipe(size())
        .pipe(gulp.dest(paths.dist.scripts))
    : browserify({
        entries: [paths.src.scripts],
        debug: true,
        plugin: [[esmify]],
      })
        .transform('babelify', {
          presets: ['@babel/preset-env'],
          ignore: ['//node_modules//'],
        })
        .bundle()
        .pipe($.plumber())
        .pipe(source('bundle.min.js'))
        .pipe(buffer())
        .pipe($.terser())
        .pipe(size())
        .pipe(gulp.dest(paths.public.scripts));
}

// Optimize and copy images
function images() {
  const destPath =
    processMode === 'production' ? paths.public.images : paths.dist.images;
  return gulp
    .src(paths.src.images)
    .pipe(
      gulpif(
        process.env.NODE_ENV === 'production',
        imagemin({
          optimizationLevel: 3,
          progressive: true,
          interlaced: true,
        })
      )
    )
    .pipe(gulp.dest(destPath));
}

// Start a server with livereload
function server(done) {
  browser.init({
    server: 'dist',
  });
  done();
}

// Watch for file changes
function watch() {
  gulp.watch(paths.watch.templates).on('all', gulp.series(templates, browser.reload));
  gulp.watch(paths.watch.styles).on('all', gulp.series(styles, browser.reload));
  gulp.watch(paths.watch.scripts).on('all', gulp.series(scripts, browser.reload));
  gulp.watch(paths.watch.images).on('all', gulp.series(images, browser.reload));
}

// Gulp-tasks
gulp.task('assets', gulp.series(images));
gulp.task('build', gulp.series(clean, styles, scripts, templates, 'assets')
);
gulp.task('clean', gulp.series(clean));
gulp.task( 'default', gulp.series(
    clean,
    styles,
    scripts,
    templates,
    images,
    server,
    watch
  )
);
