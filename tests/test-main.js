var allTestFiles = [];
var TEST_REGEXP = /^\/base\/tests\/.*-spec\.js$/;


Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        allTestFiles.push(file);
    }
});

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/',

    paths: {
        'angular': '/base/bower_components/angular/angular',
        'angularMocks': '/base/bower_components/angular-mocks/angular-mocks',
        'jQuery': '/base/bower_components/jquery/jquery',
        'lodash': '/base/bower_components/lodash/dist/lodash',
        'datepick': '/base/bower_components/datepick/jquery.datepick',
        'moment': '/base/bower_components/moment/moment',
        'partials':'/base/src/dt-picker.html'
    },

    shim: {
        'jQuery': {'exports': 'jQuery'},
        'lodash': {'exports': 'lodash'},
        'moment': {'exports': 'moment'},
        'datepick': {deps: ['jQuery'], 'exports': 'datepick'},
        'angular': {'exports': 'angular'},
        'angularMocks': {deps: ['angular'], 'exports': 'angular.mock'},
        'partials': {
            exports: 'partials',
            deps: ['angular']
        }
    },
    priority: ['jQuery', 'angular', 'datepick'],

    // dynamically load all test files
    deps: allTestFiles,

    // we have to kickoff jasmine, as it is asynchronous
    callback: window.__karma__.start
});