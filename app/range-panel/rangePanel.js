import template from './rangePanel.html';
import moment from 'moment';
import TimeResolution from '../timeResolution';
import _ from 'lodash';

function rangePanel($timeout, pickerService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            observer: '=',
            dictionary: '=',
            hideTimeUnit: '=',
            singleDate: '='
        },
        template: template,
        link: function (scope) {
            /**
             *  Sets all the duration panel controls according to selected range.
             */
            function setupDurationControls() {
                if (scope.internalRange.selectedRange.custom) {
                    var from = moment(scope.internalRange.from);
                    var to = moment(scope.internalRange.to);
                    scope.selectedFrom = _.find(scope.hours, { value: from.hour() });
                    if (to.diff(from, 'minutes') === 10) {
                        scope.selectedDuration = _.find(scope.durations, { value: 10, unit: 'minutes' });
                    } else {
                        const duration = pickerService.timeDifference(scope.internalRange.from, scope.internalRange.to);
                        scope.selectedDuration = _.find(scope.durations, { value: duration.value, unit: duration.unit }) || duration;
                    }
                } else if (scope.internalRange.selectedRange.label === 'Last Hour') {
                    scope.selectedFrom = _.find(scope.hours, { value: -1 });
                    scope.selectedDuration = _.find(scope.durations, { value: 1, unit: 'hours' });
                } else if (scope.internalRange.selectedRange.label === 'Last 10 Minutes') {
                    scope.selectedFrom = _.find(scope.hours, { value: -10 });
                    scope.selectedDuration = _.find(scope.durations, { value: 10, unit: 'minutes' });
                } else {
                    var fromHour = new moment(scope.internalRange.suggestedRange().from).hour();
                    scope.selectedFrom = _.find(scope.hours, { value: fromHour });
                    var duration = pickerService.timeDifference(scope.internalRange.from, scope.internalRange.to);
                    scope.selectedDuration = _.find(scope.durations, { value: duration.value, unit: duration.unit });
                }
            }
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

            function setupHours () {
                var h = [];
                if (_.find(scope.dictionary, { label: 'Last 10 Minutes'})) {
                    h.push({ value: -10, unit: 'minute', label: 'Ten minutes ago' });
                }

                if (_.find(scope.dictionary, { label: 'Last Hour'})) {
                    h.push({ value: -1, unit: 'hour', label: 'An hour ago' });
                }
                return h.concat(pickerService.hours);
            }

            function setupDurations() {
                var d = [];
                if (_.find(scope.dictionary, { label: 'Last 10 Minutes'})) {
                    d.push({ value: 10, unit: 'minutes', label: '10 minutes' });
                }
                return d.concat(pickerService.durations)
            }

            /**
             * Executes when a range is selected and emitted by any of the other components
             * @param range
             */
            function onRangeSet(range) {
                scope.internalRange = range;
                setupDurationControls();
                setupAvailableTimeUnits();
            }

            $timeout(function () {
                scope.observer.subscribe('rangePanel', onRangeSet);
                scope.hours = setupHours();
                scope.durations = setupDurations();
            });

            /**
             * Executes when a user selects an available range.
             * @param range
             */
            scope.selectRangeOption = function (range) {
                const newDate = scope.internalRange.changeWithRangeOption(range);
                scope.internalRange = newDate;
                setupAvailableTimeUnits();
                setupDurationControls();
                scope.observer.emit('rangePanel', newDate);
            };

            scope.selectTimeUnit = function (unit) {
                const newDate = scope.internalRange.changeWithTimeUnit(unit);
                scope.internalRange = newDate;
                scope.observer.emit('rangePanel', newDate);
            };

            /**
             * Executes when a user selects a different starting hour from time range selector
             * @param hour taken from scope.hours like { value: 0, label: '0:00' }. Exceptions to this format are last hour and last 10 minutes.
             */
            scope.selectFrom = function (hour) {
                var newDate;
                if (hour.value === -1) {
                    newDate = TimeResolution.timeResolutionFromLocal(_.find(scope.dictionary, { label: 'Last Hour' }));
                    scope.selectedDuration = { value: 1, unit: 'hours', label: '1 hour' };
                } else if (hour.value === -10) {
                    newDate = TimeResolution.timeResolutionFromLocal(_.find(scope.dictionary, { label: 'Last 10 Minutes' }));
                    scope.selectedDuration = { value: 10, unit: 'minutes', label: '10 minutes' };
                } else {
                    newDate = scope.internalRange.changeStartingHour(hour);
                }
                scope.selectedFrom = hour;
                scope.internalRange = newDate;
                scope.observer.emit('rangePanel', newDate);
            };

            /**
             * Executes when a user selects a duration from time range selector
             * @param duration a duration in hours, taken from scope.durations like { value: 1, label: '1 hour' }. Only exception is for 10 minutes.
             */
            scope.selectDuration = function (duration) {
                scope.selectedDuration = duration;
                var newDate = scope.internalRange.changeWithDuration(duration);
                scope.internalRange = newDate;
                scope.observer.emit('rangePanel', newDate);
            };
        }
    }
}

export default rangePanel;