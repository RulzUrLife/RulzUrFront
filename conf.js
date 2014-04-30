var fs = require('fs');

var paths = {
  dist: 'dist',
  dev: 'app',
  tmp: '.tmp',
  styles: '/styles',
  images: '/images',
  scripts: '/scripts',
  fonts: '/fonts',
  bower_components: JSON.parse(fs.readFileSync('.bowerrc')).directory,
  karma_conf: 'karma.conf.js',
  protractor_conf: 'protractor.conf.js',
  test_unit: 'test/unit',
  test_e2e: 'test/e2e'
};

paths.html = [
  paths.dev + '/index.html',
  paths.dev + '/404.html',
  paths.dev + '/views/**/*.html'
];

paths.sass = paths.dev + paths.styles + '/main.scss';

module.exports = {
  paths: paths
};