'use_strict';

module.exports = function(grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var banner = ['/**',
    ' * @file <%= pkg.name %> - <%= pkg.homepage %>',
    ' * @module <%= pkg.name %>',
    ' * ',
    ' * @see <%= pkg.homepage %>',
    ' * @version <%= pkg.version %>',
    ' * @license <%= pkg.license %>',
    ' */\n'
  ].join('\n');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: [],
        commit: true,
        push: false,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json']
      }
    },
    cssmin: {
      options: {
        banner: banner
      },
      main: {
        files: {
          'dist/ez-gridster.min.css': ['dist/ez-gridster.css'],
          'dist/ez-gridster-resizable.min.css': ['dist/ez-gridster-resizable.css']
        }
      }
    },
    concat: {
      options: {
        banner: banner + [
          '(function(angular) {',
          '\'use strict\';\n',
        ].join('\n'),
        footer: '}(angular));',
      },
      main: {
        src: ['src/js/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    connect: {
      options: {
        port: 9005,
        hostname: 'localhost'
      },
      dev: {
        options: {
          open: true,
          livereload: 35729
        }
      },
      cli: {
        options: {}
      }
    },
    jsbeautifier: {
      options: {
        config: '.jsbeautifyrc'
      },
      dev: {
        src: ['demo/**/*.{html, js}', 'src/**/*.js', 'test/**/*.js', 'Gruntfile.js', 'karma.conf.js', 'bower.json', 'index.html', 'ptor.conf.js']
      },
      dist: {
        src: ['dist/ez-gridster.js']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['src/js/*/*.js', 'test/**/*.js']
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        background: true,
        singleRun: false,
        browsers: ['PhantomJS']
      },
      singleRun: {
        configFile: 'karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
      }
    },
    less: {
      dev: {
        files: {
          'dist/ez-gridster.css': 'src/less/ez-gridster.less'
        }
      },
      demo: {
        files: {
          'demo/css/style.css': ['demo/less/*']
        }
      }
    },
    ngtemplates: {
      ezList: {
        src: 'src/templates/*.html',
        dest: 'dist/ez-gridster-tpl.min.js',
        options: {
          module: 'ez.gridster',
          url: function(url) {
            return url.replace('src/templates/', '');
          },
          htmlmin: {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyAttributes: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
          }
        }
      }
    },
    uglify: {
      dist: {
        options: {
          banner: banner,
        },
        src: ['dist/ez-gridster.js'],
        dest: 'dist/ez-gridster.min.js'
      }
    },
    watch: {
      option: {
        port: 11739
      },
      dev: {
        files: ['Gruntfile.js', 'karma.conf.js', 'ptor.conf.js', 'src/**/*', 'test/*/*.js'],
        tasks: ['jshint', 'concat', 'jsbeautifier:dist', 'uglify', 'less', 'cssmin'],
        options: {
          reload: true,
          livereload: true,
        }
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'concat', 'ngtemplates', 'uglify', 'less', 'cssmin']);

  grunt.registerTask('dev', ['watch:dev']);

};
