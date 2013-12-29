module.exports = function(config) {
  config.set({
    basePath: '',

    frameworks: ['mocha', 'chai'],

    files: [
      // libraries
      'bower_components/jquery/jquery.js',
      'bower_components/jquery-ui/ui/jquery-ui.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/gridster/dist/jquery.gridster.js',

      // our app
      'src/ez-gridster.js',
      'dist/ez-gridster-tpl.js',

      // tests
      'test/*Spec.js',
    ],

    autoWatch: true,
    browsers: ['Chrome']
  });
};
