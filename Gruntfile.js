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
        jshintrc: '.jshintrc'
      },
      src: {
        files: {
          src: ['src/*.js']
        },
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: false,
        background: false
      },
      singleRun: {
        configFile: 'karma.conf.js',
        background: false,
        singleRun: true
      }
    },
    clean: {
      clearCoverage: 'test/coverage/*'
    },
    uglify: {
      options: {
        mangle: true,
        compile: true,
        compress: true
      },
      dist: {
        files: {
          'dist/ez-gridster.min.js': ['src/**/*.js']
        }
      }
    },
    watch: {
      all: {
        files: ['Gruntfile.js', 'src/*', 'test/*'],
        tasks: ['default', 'karma:unit:run']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'uglify']);
  grunt.registerTask('dev', ['clean:clearCoverage', 'karma:unit:start', 'watch:all']);
  grunt.registerTask('test', ['karma:singleRun']);
};
