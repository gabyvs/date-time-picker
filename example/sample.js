(function (angular) {
    'use strict';

    var module = angular.module('sample', ['ngRoute', 'dt-picker']);

    module.config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when('/', {
                    controller:'sample',
                    templateUrl:'sample.html'
                })
                .otherwise({
                    redirectTo:'/'
                });
        }
    ]);

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