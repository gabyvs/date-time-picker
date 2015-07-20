;(function () {
    'use strict';

    function directive () {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            link: function (scope, element, attrs) {
            }
        }
    }

    function createModule (angular) {
        var module = angular.module('dt-picker', []);
        module.factory('dtPicker.service', [
            function () {
                return { version: '0.1.0' };
            }
        ]);
        module.directive('dtPicker', [directive]);
        return module;

//        angular.module('availability_board', []).factory('availability-service', function () { return createModule(angular); });
//        angular.module('availability_board').directive('availability-board', [directive]);
    }

    /*--------------------------------------------------------------------------*/

    // Verify if define is present as a function.
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        define(['angular'], function(angular) {
            return createModule(angular);
        });
    }
    else if ( typeof angular !== "undefined" && angular !== null ) {
        createModule(angular);
    }
}.call(this));
