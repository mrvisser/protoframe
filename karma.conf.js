/* eslint-disable @typescript-eslint/no-var-requires */

// Karma configuration
// Generated on Wed May 27 2020 14:52:46 GMT-0400 (Eastern Daylight Time)

module.exports = (config) => {
  config.set({
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome', 'Firefox'],

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // list of files / patterns to exclude
    exclude: [],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/regenerator-runtime/runtime.js',
      'src/*.ts',
      'src/**/*.ts',
      'test/*.ts',
      'test/**/*.ts',
    ],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    karmaTypescriptConfig: {
      bundlerOptions: {
        acornOptions: {
          ecmaVersion: 11,
        },
        transforms: [require('karma-typescript-es6-transform')()],
      },
    },

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // web server port
    port: 9876,

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '**/*.ts': 'karma-typescript',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['spec', 'karma-typescript'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,
  });
};
