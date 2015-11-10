import angular from 'angular';
import jQuery from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import template from './date-time-picker.html';

function dtPicker(service, bootstrapService) {
    var $ = jQuery;
    bootstrapService.bootstrap();
    return {
        restrict: 'E',
        replace: true,
        scope: {
            range: '=',
            options: '=',
            rangeDictionary: '='
        },
        template: template,
        link: function (scope, element) {
            /**
             * After a user selects an option that includes a date range or sets a date range with the double calendar,
             * this function verifies which time units are available to select from (hours and days).
             * Up to 36 hours the only time unit available is hours.
             * More than 36 hours and up to 7 days can be retrieved by hours and days.
             * For more days than that the only available unit is days.
             * @param from
             * @param to
             */
            function setupAvailableTimeUnits (from, to) {
                var hours = moment(to).diff(moment(from), 'hours');
                if (hours > 36 && hours < 200) {
                    scope.internalRangeObject.selectedRange.timeUnits = [ 'hour', 'day' ];
                } else {
                    delete scope.internalRangeObject.selectedRange.timeUnits;
                }
            }

            /**
             *  After a user selects an option that represents a time range, e.g. last hour, this function sets all the time range controls accordingly.
             */
            function setupTimeRange() {
                if (scope.internalRangeObject.selectedRange.label === 'Time Range') {
                    var from = moment(scope.internalRangeObject.from);
                    var to = moment(scope.internalRangeObject.to);
                    scope.selectedFrom = _.find(scope.hours, { value: from.hour() });
                    if (to.diff(from, 'minutes') === 10) {
                        scope.selectedDuration = _.find(scope.durations, { value: 10, unit: 'minutes' });
                    } else {
                        scope.selectedDuration = _.find(scope.durations, { value: to.diff(from, 'hours'), unit: 'hours' });
                    }
                } else if (scope.internalRangeObject.selectedRange.label === 'Last Hour') {
                    scope.selectedFrom = _.find(scope.hours, { value: -1 });
                    scope.selectedDuration = _.find(scope.durations, { value: 1, unit: 'hours' });
                } else if (scope.internalRangeObject.selectedRange.label === 'Last 10 Minutes') {
                    scope.selectedFrom = _.find(scope.hours, { value: -10 });
                    scope.selectedDuration = _.find(scope.durations, { value: 10, unit: 'minutes' });
                } else {
                    var fromHour = new moment(scope.internalRangeObject.suggestedRange().from).hour();
                    scope.selectedFrom = _.find(scope.hours, { value: fromHour });
                    var durationInHours = service.hourDifference(scope.internalRangeObject.from, scope.internalRangeObject.to);
                    scope.selectedDuration = _.find(scope.durations, { value: durationInHours, unit: 'hours' });
                }

                scope.singleDate = new Date(scope.internalRangeObject.suggestedRange().from);
            }

            /**
             * After a user selects an option that represents a date range, e.g. 7 days, this function sets all date range controls accordingly.
             */
            function setupDateRange() {
                var from = scope.internalRangeObject.suggestedRange().from;
                scope.dateRange = {
                    fromDay: new Date(from),
                    fromMonth: moment(from).month(),
                    fromYear: moment(from).year(),
                    toDay: new Date(scope.internalRangeObject.suggestedRange().to)
                };
                setupAvailableTimeUnits(scope.internalRangeObject.suggestedRange().from, scope.internalRangeObject.suggestedRange().to);
            }

            function updateControls() {
                if (scope.isTimeRange) {
                    setupTimeRange();
                } else {
                    setupDateRange();
                }
            }

            /**
             * After a user selects any option this function sets all the controls according to the user selection.
             * When the directive needs to update the selected range, like when refreshing or opening the configure area, this sets all the controls according to last saved selection.
             */
            function setInternalSelections(honorTimeUnit) {
                if (!scope.internalRangeObject.selectedRange) { return; }
                if (scope.internalRangeObject.selectedRange.custom) {
                    if (scope.internalRangeObject.selectedRange.custom === 'date') {
                        if (scope.isTimeRange) {
                            // In this case, double calendar needs to be initialized with a default range
                            var from = new moment(scope.internalRangeObject.from).startOf('day');
                            var to = new moment(scope.internalRangeObject.to).endOf('day');
                            scope.internalRangeObject = service.timeResolution(from.valueOf(), to.valueOf());
                            scope.internalRangeObject.selectedRange = _.find(scope.dictionary, { custom: 'date' });
                            scope.isTimeRange = false;
                        }
                    } else {
                        if (!scope.isTimeRange) {
                            // In this case, single calendar needs to be initialized with a default range
                            var from = new moment(scope.internalRangeObject.from).startOf('day');
                            var to = new moment(scope.internalRangeObject.from).startOf('day').add(1, 'day');
                            scope.internalRangeObject = service.timeResolution(from.valueOf(), to.valueOf());
                            scope.internalRangeObject.selectedRange = _.find(scope.dictionary, { custom: 'time' });
                            scope.isTimeRange = true;
                        }
                    }
                } else {
                    scope.internalRangeObject = service.timeResolutionFromLocal(scope.internalRangeObject.selectedRange, honorTimeUnit ? scope.internalRangeObject.timeUnit : false);
                    scope.isTimeRange = service.isTimeRange(scope.internalRangeObject.selectedRange);
                }
                if (!honorTimeUnit) {
                    scope.internalRangeObject.timeUnit = scope.internalRangeObject.suggestedTimeUnit();
                }
            }

            function setupInternalRange (from, to, rangeOption) {
                scope.internalRangeObject = service.timeResolution(from, to);
                scope.internalRangeObject.selectedRange = _.find(scope.dictionary, rangeOption);
                scope.internalRangeObject.timeUnit = scope.internalRangeObject.suggestedTimeUnit();
            }

            scope.onDateSelected = function (dateSelected) {
                var newFrom = new moment(scope.internalRangeObject.from);
                var newDateSelected = new moment(dateSelected);
                newFrom.year(newDateSelected.year()).month(newDateSelected.month()).date(newDateSelected.date());

                var newTo = new moment(newFrom.valueOf()).add(scope.selectedDuration.value, 'hours');
                setupInternalRange(newFrom.valueOf(), newTo.valueOf(), { custom: 'time' });
                scope.$apply();
            };

            /**
             * Executes when a user selects a date in the double calendar, updating internal range.
             * When the user selects the first date on the range, it also updates available dates for range ending according to the maximum range allowed in days.
             */
            scope.onRangeSelected = function (dates) {
                setupInternalRange(dates.from, dates.to, { custom: 'date' });
                setupAvailableTimeUnits(dates.from, dates.to);
                scope.$apply();
            };

            /**
             * Executes when a user selects an available range.
             * @param range
             */
            scope.selectRangeOption = function (range) {
                scope.internalRangeObject.selectedRange = range;
                setInternalSelections();
                updateControls();
            };

            /**
             * Initializes calendars, available options for dropdowns with ranges, durations and starting hours.
             * It also sets main label initial state, and starts the range shared with main controller.
             */
            function setupInitialConfigurations() {
                // Initializing available options for ranges, starting hours and durations.
                if (scope.rangeDictionary) { scope.dictionary = scope.rangeDictionary; }
                else { scope.dictionary = service.defaultDictionary; }

                var h = [];
                var d = [];

                if (_.find(scope.dictionary, { label: 'Last 10 Minutes'})) {
                    h.push({ value: -10, unit: 'minute', label: 'Ten minutes ago' });
                    d.push({ value: 10, unit: 'minutes', label: '10 minutes' });
                }

                if (_.find(scope.dictionary, { label: 'Last Hour'})) {
                    h.push({ value: -1, unit: 'hour', label: 'An hour ago' });
                }

                scope.hours = h.concat(service.hours);
                scope.durations = d.concat(service.durations);

                if (scope.options && scope.options.hideCustom) {
                    _.remove(scope.dictionary, { custom: 'date' });
                }
                if (scope.options && scope.options.hideTimeUnit) {
                    scope.hideTimeUnit = true;
                }
                scope.maxRange = scope.options && scope.options.maxRange || 31;

                // Initializing main internal object and controller range object, this will set initial range and main label.
                scope.internalRangeObject = {};
                scope.selectRangeOption(_.find(scope.dictionary, { preselected: true }) || scope.dictionary[0]);
                scope.threeLetterTimezoneLabel = service.browserTimezone();
                var range = service.timeResolutionFromLocal(scope.internalRangeObject.selectedRange);
                scope.range = { from: range.from, to: range.to, timeUnit: range.suggestedTimeUnit() };
                scope.savedRange = scope.internalRangeObject.selectedRange;
            }

            /**
             * Executes when a user clicks over the main label, causing the configure area to open.
             * It resets all controls to last saved range, and adjusted to current moment.
             */
            scope.configure = function () {
                scope.internalRangeObject.selectedRange = scope.savedRange;
                scope.internalRangeObject.from = scope.range.from;
                scope.internalRangeObject.to = scope.range.to;
                scope.internalRangeObject.timeUnit = scope.range.timeUnit;
                setInternalSelections(true);
                updateControls();
                scope.configuring = true;
            };

            /**
             * Executes when a user selects the starting hour from time range selector, modifying internal ranges and probably duration.
             * @param hour taken from scope.hours like { value: 0, label: '0:00' }. Exceptions to this format are last hour and last 10 minutes.
             */
            scope.selectFrom = function (hour) {
                // Case of an hour ago, changes date, duration and internal selection
                if (hour.value === -1) {
                    scope.selectRangeOption(_.find(scope.dictionary, { label: 'Last Hour' }));
                } else if (hour.value === -10) {
                    scope.selectRangeOption(_.find(scope.dictionary, { label: 'Last 10 Minutes' }));
                } else { // Case of selecting an hour, changes only the hour part of the from
                    scope.selectedFrom = hour;
                    var newFrom = new moment(scope.internalRangeObject.from);
                    newFrom.hour(hour.value).minute(0).second(0).millisecond(0);
                    var newTo = new moment(newFrom.valueOf()).add(scope.selectedDuration.value, scope.selectedDuration.unit);
                    setupInternalRange(newFrom.valueOf(), newTo.valueOf(), { custom: 'time' });
                }
            };

            /**
             * Executes when a user selects a duration from time range selector, modifying internal ranges.
             * @param duration a duration in hours, taken from scope.durations like { value: 1, label: '1 hour' }. Only exception is for 10 minutes.
             */
            scope.selectDuration = function (duration) {
                scope.selectedDuration = duration;
                var newTo = new moment(scope.internalRangeObject.from).add(scope.selectedDuration.value, scope.selectedDuration.unit);
                setupInternalRange(scope.internalRangeObject.from, newTo.valueOf(), { custom: 'time' });
            };

            scope.selectTimeUnit = function (unit) {
                scope.internalRangeObject.timeUnit = unit;
                setInternalSelections(true);
            };

            /**
             * Only closes configuring space, without saving user changes.
             */
            scope.close = function () {
                scope.configuring = false;
            };

            /**
             * Takes last saved user selection to calculate ranges with current moment,
             * then it modifies controller range object with updated range.
             */
            scope.refresh = function () {
                scope.internalRangeObject.selectedRange = scope.savedRange;
                setInternalSelections(true);
                scope.save();
            };

            /**
             *  Saves user selections into controller range object, closing configuring area.
             */
            scope.save = function () {
                scope.savedRange = scope.internalRangeObject.selectedRange;
                scope.range.from = scope.internalRangeObject.from;
                scope.range.to = scope.internalRangeObject.to;
                scope.range.timeUnit = scope.internalRangeObject.timeUnit;
                scope.configuring = false;
            };

            setupInitialConfigurations();
        }
    }
}

export default dtPicker;
