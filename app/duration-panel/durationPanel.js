import template from './durationPanel.html';
import moment from 'moment';

function durationPanel($timeout, pickerService) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            dictionary: '=',
            observer: '='
        },
        template: template,
        link: function (scope) {
            /**
             *  Sets all the duration panel controls according to selected range.
             */
            function setupControls() {
                if (scope.internalRange.selectedRange.label === 'Time Range') {
                    var from = moment(scope.internalRangeObject.from);
                    var to = moment(scope.internalRangeObject.to);
                    scope.selectedFrom = _.find(scope.hours, { value: from.hour() });
                    if (to.diff(from, 'minutes') === 10) {
                        scope.selectedDuration = _.find(scope.durations, { value: 10, unit: 'minutes' });
                    } else {
                        scope.selectedDuration = _.find(scope.durations, { value: to.diff(from, 'hours'), unit: 'hours' });
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
                    var durationInHours = pickerService.hourDifference(scope.internalRange.from, scope.internalRange.to);
                    scope.selectedDuration = _.find(scope.durations, { value: durationInHours, unit: 'hours' });
                }
            }

            /**
             * Executes when a range is selected and emitted by any of the other components
             * @param range
             */
            function onRangeSet(range) {
                scope.internalRange = range;
                setupControls();
            }

            $timeout(function () {
                scope.observer.subscribe('durationPanel', onRangeSet);
            });

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

            scope.hours = setupHours();
            scope.durations = setupDurations();

            // TODO: implement this
            scope.selectFrom = function () {

            };

            // TODO: implement this
            scope.selectDuration = function () {

            }
        }
    }
}

export default durationPanel;