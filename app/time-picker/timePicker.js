import template from './timePicker.html';
import moment from 'moment';
import _ from 'lodash';

function timePicker($timeout) {
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

            function callUpdate() {
                scope.internalSetting = true;
                scope.update({ value: moment(scope.time).hours(scope.hours).minutes(scope.minutes) });
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
                callUpdate();
            };

            scope.incrementMinutes= function () {
                var minutes = Number(scope.minutes) + 5;
                if (minutes > 59) { minutes = 0; }
                scope.minutes = twoDigits(minutes);
                callUpdate();
            };

            scope.decrementHours = function () {
                var hours = Number(scope.hours) - 1;
                if (hours < 0) { hours = 23; }
                scope.hours = twoDigits(hours);
                callUpdate();
            };

            scope.decrementMinutes= function () {
                var minutes = Number(scope.minutes) - 5;
                if (minutes < 0) { minutes = 55; }
                scope.minutes = twoDigits(minutes);
                callUpdate();
            };

            scope.changeHours = function () {
                if (!_.isNumber(Number(scope.hours)) || _.isNaN(Number(scope.hours)) || scope.hours > 23 || scope.hours < 0) {
                    scope.invalidHours = true;
                    return;
                }
                scope.invalidHours = false;
                callUpdate();
            };

            scope.changeMinutes = function () {
                if (!_.isNumber(Number(scope.minutes)) || _.isNaN(Number(scope.minutes)) || scope.minutes > 59 || scope.minutes < 0) {
                    scope.invalidMinutes = true;
                    return;
                }
                scope.invalidMinutes = false;
                callUpdate();
            };
        }
    }
}

export default timePicker;