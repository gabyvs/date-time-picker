import template from './rangePanel.html';
import moment from 'moment';

function rangePanel($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            observer: '=',
            dictionary: '=',
            hideTimeUnit: '='
        },
        template: template,
        link: function (scope) {
            /**
             * After a user selects an option that includes a date range or sets a date range with the double calendar,
             * this function verifies which time units are available to select from (hours and days).
             * Up to 36 hours the only time unit available is hours.
             * More than 36 hours and up to 7 days can be retrieved by hours and days.
             * For more days than that the only available unit is days.
             * @param from
             * @param to
             */
            // FIXME: max resolution is now hardcoded to 200 (because of highcharts performance issues), it should be configurable
            function setupAvailableTimeUnits () {
                var hours = moment(scope.internalRange.to).diff(moment(scope.internalRange.from), 'hours');
                if (hours > 36 && hours < 200) {
                    scope.internalRange.selectedRange.timeUnits = [ 'hour', 'day' ];
                } else if (hours > 1 && hours < 4) {
                    scope.internalRange.selectedRange.timeUnits = [ 'minute', 'hour' ];
                } else {
                    delete scope.internalRange.selectedRange.timeUnits;
                }
            }
            /**
             * Executes when a range is selected and emitted by any of the other components
             * @param range
             */
            function onRangeSet(range) {
                scope.internalRange = range;
                setupAvailableTimeUnits();
            }

            $timeout(function () {
                scope.observer.subscribe('rangePanel', onRangeSet);
            });

            /**
             * Executes when a user selects an available range.
             * @param range
             */
            scope.selectRangeOption = function (range) {
                const newDate = scope.internalRange.changeWithRangeOption(range);
                scope.internalRange = newDate;
                setupAvailableTimeUnits();
                scope.observer.emit('rangePanel', newDate);
            };

            scope.selectTimeUnit = function (unit) {
                const newDate = scope.internalRange.changeWithTimeUnit(unit);
                scope.internalRange = newDate;
                scope.observer.emit('rangePanel', newDate);
            };
        }
    }
}

export default rangePanel;