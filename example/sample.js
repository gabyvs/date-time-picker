(function (angular) {
    'use strict';

    angular.module('sample', ['ngRoute']).config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/', {
                    controller:'index', // I name the main controller on each page as 'app' as a personal preference.
                    templateUrl:'views/index.html'
                })
                .otherwise({
                    redirectTo:'/'
                });
        }
    ]);

    // In case you want to define some stuff to be available globally, use this.
    angular.module('sample').run([
        function () {
        }
    ]);
} (angular));