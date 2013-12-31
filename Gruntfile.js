'use_strict';

module.exports = function(grunt) {
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
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        },
      },
      src: {
        options: {
          node: true,
          globals: {
            it: true,
            beforeEach: true,
            expect: true,
            element: true,
            browser: true,
            module: true,
            spyOn: true,
            inject: true,
            repeater: true,
            describe: true,
            angular: true,
            jQuery: true
          }
        },
        files: {
          src: ['src/**/*.js', 'test/**/*.js']
        },
      }
    },
    less: {
      dist: {
        options: {
          yuicompress: true
        },
        files: {
          "dist/ez-gridster.min.css": "src/less/ez-gridster.less"
        }
      }
    },
    ngtemplates:  {
      ezGridster:      {
        src:      'src/*.html',
        dest:     'dist/ez-gridster-tpl.js',
        options: {
          module: 'ez.gridster',
          url: function(url) { return url.replace('src/', ''); }
        }
      }
    },
    uglify: {
      options: {
        mangle: false,
        compress: true
      },
      dist: {
        files: {
          'dist/ez-gridster.min.js': ['src/**/*.js']
        }
      }
    },
    watch: {
      dev: {
        files: ['src/**/*'],
        tasks: ['default'],
        options: {
          livereload: 9090,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-angular-templates');

  grunt.registerTask('default', ['jshint', 'ngtemplates', 'uglify', 'less']);
};
