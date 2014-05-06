var fs = require('fs');

var paths = {
  build: 'build',
  dev: 'app',
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

module.exports = {
  paths: paths
};