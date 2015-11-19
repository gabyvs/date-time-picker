import template from './timePicker.html';
import moment from 'moment';
import _ from 'lodash';

export function timePicker() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            time: '=',
            update: '&'
        },
        template: template,
        link: function (scope) {
            function twoDigits(n) {
                return n > 9 ? "" + n : "0" + n;
            }

            scope.$watch('time', (value) => {
                if (!value) { return; }
                if (scope.internalSetting) { scope.internalSetting = false; return; }
                scope.hours = twoDigits(moment(value).hours());
                scope.minutes = twoDigits(moment(value).minutes());
            });

            scope.incrementHours = function () {
                var hours = Number(scope.hours) + 1;
                if (hours > 23) { hours = 0; }
                scope.hours = twoDigits(hours);
                scope.callUpdate();
            };

            scope.incrementMinutes= function () {
                var minutes = Number(scope.minutes) + 5;
                if (minutes > 59) { minutes = 0; }
                scope.minutes = twoDigits(minutes);
                scope.callUpdate();
            };

            scope.decrementHours = function () {
                var hours = Number(scope.hours) - 1;
                if (hours < 0) { hours = 23; }
                scope.hours = twoDigits(hours);
                scope.callUpdate();
            };

            scope.decrementMinutes= function () {
                var minutes = Number(scope.minutes) - 5;
                if (minutes < 0) { minutes = 55; }
                scope.minutes = twoDigits(minutes);
                scope.callUpdate();
            };

            scope.callUpdate = function () {
                scope.internalSetting = true;
                scope.update({ value: moment(scope.time).hours(scope.hours).minutes(scope.minutes) });
            }
        }
    };
}

export function hours() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            var INTEGER_REGEXP = /^\-?\d+$/;
            ctrl.$validators.hours = function(modelValue, viewValue) {
                if (INTEGER_REGEXP.test(viewValue) && viewValue > 0 && viewValue < 24) {
                    return true;
                }
                return false;
            };
        }
    };
}

export function minutes() {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function(scope, elm, attrs, ctrl) {
            var INTEGER_REGEXP = /^\-?\d+$/;
            ctrl.$validators.minutes = function(modelValue, viewValue) {
                if (INTEGER_REGEXP.test(viewValue) && viewValue > 0 && viewValue < 60) {
                    return true;
                }
                return false;
            };
        }
    };
}