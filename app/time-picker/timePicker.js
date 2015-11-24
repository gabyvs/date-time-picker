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
            function format(n) {
                var num = Number(n);
                if (!_.isNumber(num) || _.isNaN(num)) { num = 0; }
                return num > 9 ? "" + num : "0" + num;
            }

            function callUpdate() {
                scope.internalSetting = true;
                scope.update({ value: moment(scope.time).hours(scope.hours).minutes(scope.minutes).valueOf() });
            }

            scope.$watch('time', (value) => {
                if (!value) { return; }
                if (scope.internalSetting) { scope.internalSetting = false; return; }
                scope.hours = format(moment(value).hours());
                scope.minutes = format(moment(value).minutes());
            });

            scope.incrementHours = function () {
                var hours = Number(scope.hours) + 1;
                if (hours > 23) { hours = 0; }
                scope.hours = format(hours);
                callUpdate();
            };

            scope.incrementMinutes= function () {
                var minutes = Number(scope.minutes) + 5;
                if (minutes > 59) { minutes = 0; }
                scope.minutes = format(minutes);
                callUpdate();
            };

            scope.decrementHours = function () {
                var hours = Number(scope.hours) - 1;
                if (hours < 0) { hours = 23; }
                scope.hours = format(hours);
                callUpdate();
            };

            scope.decrementMinutes= function () {
                var minutes = Number(scope.minutes) - 5;
                if (minutes < 0) { minutes = 55; }
                scope.minutes = format(minutes);
                callUpdate();
            };

            scope.changeHours = function () {
                if (!scope.hours) { return; }
                callUpdate();
            };

            scope.changeMinutes = function () {
                if (!scope.minutes) { return; }
                callUpdate();
            };

            scope.renderHours = function () {
                if (!scope.hours) { return; }
                scope.hours = format(scope.hours);
            };

            scope.renderMinutes = function () {
                if (!scope.minutes) { return; }
                scope.minutes = format(scope.minutes);
            };
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
                if (INTEGER_REGEXP.test(viewValue) && viewValue > -1 && viewValue < 24) {
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
                if (INTEGER_REGEXP.test(viewValue) && viewValue > -1 && viewValue < 60) {
                    return true;
                }
                return false;
            };
        }
    };
}