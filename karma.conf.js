module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['mocha', 'chai'],

    reporters: ['progress', 'coverage'],

    files: [
      // libraries
      'bower_components/jquery/dist/jquery.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/gridster/dist/jquery.gridster.js',

      // our app
      'src/ez-gridster.js',

      // tests
      'test/*Spec.js',
    ],

    preprocessors: {
      'src/ez-gridster.js': ['coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type : 'html',
      dir : 'test/coverage/'
    },

    port: 1941,

    browsers: ['Chrome']
  });
};
