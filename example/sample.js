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
//            $scope.options = { hideTimeUnit: true };

            // Options for initial setup of date time picker in order of precedence
            // 1. Label
//            const label = 'Last 24 Hours';
//            $scope.range = { label: label };

            // 2. Duration + from
//            const duration = { unit: 'hours', value: 4, label: '4 hours' };
//            const from = moment().subtract(1, 'days').valueOf();
//            $scope.range = { duration: duration, from: from };

            // 3. Duration
//            const duration = { unit: 'weeks', value: 2 };
//            $scope.range = { duration: duration };


            // 4. From + to > This will only work on absolute mode
//            const from = moment().subtract(7, 'days').subtract(1, 'hours').valueOf();
//            const to = moment().subtract(1, 'hours').valueOf();
//            $scope.range = { from: from, to: to };

            // Default (if nothing is provided or if initial setup fails, for example, giving a label that does not match any option.
            // First option of the dictionary will be selected.
        }
    ]);
} (angular));