(function (angular) {
    'use strict';

    var module = angular.module('sample', ['ngRoute', 'dt-picker']);

    module.config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/', {
                    controller:'sample', // I name the main controller on each page as 'app' as a personal preference.
                    templateUrl:'sample.html'
                })
                .otherwise({
                    redirectTo:'/'
                });
        }
    ]);

    // In case you want to define some stuff to be available globally, use this.
    module.run([
        function () {
        }
    ]);

    module.controller('sample', [
        '$scope',
        function ($scope) {
            //
        }
    ]);
} (angular));