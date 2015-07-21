/**
 * Another angular directive for selecting date and time ranges
 * @version v0.1.0 - 2015-07-21
 * @author Gabriela Vazquez <gabs.vz@gmail.com>
 **/
;(function () {
    'use strict';

    var defaultDictionary = [
        { label: 'Last Hour', duration: { unit: 'hour', value: 1 }},
        { label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }, preselected: true},
        { label: 'Last 7 Days', duration: { unit: 'week', value: 1 }},
        { label: 'Date Range', custom: 'date' },
        { label: 'Time Range', custom: 'time' }
    ];

    var hours = [
        { value: -1, unit: 'hour', label: 'An hour ago' },
        { value: 0, label: '0:00' },
        { value: 1, label: '1:00' },
        { value: 2, label: '2:00' },
        { value: 3, label: '3:00' },
        { value: 4, label: '4:00' },
        { value: 5, label: '5:00' },
        { value: 6, label: '6:00' },
        { value: 7, label: '7:00' },
        { value: 8, label: '8:00' },
        { value: 9, label: '9:00' },
        { value: 10, label: '10:00' },
        { value: 11, label: '11:00' },
        { value: 12, label: '12:00' },
        { value: 13, label: '13:00' },
        { value: 14, label: '14:00' },
        { value: 15, label: '15:00' },
        { value: 16, label: '16:00' },
        { value: 17, label: '17:00' },
        { value: 18, label: '18:00' },
        { value: 19, label: '19:00' },
        { value: 20, label: '20:00' },
        { value: 21, label: '21:00' },
        { value: 22, label: '22:00' },
        { value: 23, label: '23:00' }
    ];

    var durations = [
        { value: 1, unit: 'hours', label: '1 hour' },
        { value: 2, unit: 'hours', label: '2 hours' },
        { value: 3, unit: 'hours', label: '3 hours' },
        { value: 6, unit: 'hours', label: '6 hours' },
        { value: 12, unit: 'hours', label: '12 hours' },
        { value: 24, unit: 'hours', label: '24 hours' },
        { value: 48, unit: 'hours', label: '48 hours' }
    ];

    function isTimeRange(selection) {
        if (selection.duration.unit === 'hour' || selection.duration.unit === 'minutes' || (selection.duration.unit == 'day' && selection.duration.value == 1)) {
            return true;
        }
        return false;
    }

    function hourDifference(from, to) {
        var fromHelper = new moment(from);
        var toHelper = new moment(to);
        return toHelper.diff(fromHelper, 'hours');
    }

    function browserTimezone (dateInput) {
        var dateObject = dateInput || new Date(),
            dateString = dateObject + "",
            tzAbbr = (
                // Works for the majority of modern browsers
                dateString.match(/\(([^\)]+)\)$/) ||
                // IE outputs date strings in a different format:
                dateString.match(/([A-Z]+) [\d]{4}$/)
                );
        if (tzAbbr) {
            // Old Firefox uses the long timezone name (e.g., "Central
            // Daylight Time" instead of "CDT")
            tzAbbr = tzAbbr[1].match(/[A-Z]/g).join("");
        }

        if (!tzAbbr) {
            tzAbbr = '';
        }
        return tzAbbr;
    }

    function timeResolution (from, to, timeUnit) {
        var self,
            timeUnits = ['second','minute','hour','day','week','month'];
        function nextUnit (string) {
            var index = timeUnits.indexOf(string);
            if(index < 0 || index > timeUnits.length - 2) {
                return timeUnits[timeUnits.length - 1];
            }
            return timeUnits[index + 1];
        }

        function millisecondsInUnit (timeUnit) {
            switch (timeUnit) {
                case 'second':
                    return 1000;
                case 'minute':
                    return (1000 * 60);
                case 'hour':
                    return (1000 * 60 * 60);
                case 'day':
                    return (1000 * 60 * 60 * 24);
                case 'week':
                    return (1000 * 60 * 60 * 24 * 7);
                case 'month':
                    return (1000 * 60 * 60 * 24 * 30);
                default:
                    return NaN;
            }
        }

        function resolution (unit) {
            if(_.isUndefined(unit)) {
                unit = self.timeUnit;
            }
            if(timeUnits.indexOf(unit) < 0) {
                return undefined;
            }
            var milliseconds = millisecondsInUnit(unit),
                from = moment(self.from).toDate().getTime(),
                to = moment(self.to).toDate().getTime(),
                range = to - from;
            return Math.floor(range / milliseconds);
        }

        function isInRange (unit) {
            var res = resolution(unit);
            if(res) {
                return resolution(unit) < self.maxResolution;
            }
            return false;
        }

        self = {
            from: from,
            to: to,
            timeUnit: timeUnit || 'second',
            maxResolution: 200,
            selectedRange: 'custom',
            suggestedTimeUnit: function () {
                var newR = self.timeUnit,
                    end = timeUnits[timeUnits.length - 1];

                while (newR !== end) {
                    if(isInRange(newR)) {
                        break;
                    }
                    newR = nextUnit(newR);
                }
                return newR;
            },
            suggestedRange: function () {
                var unit = self.suggestedTimeUnit();
                var result = {
                    from: moment(self.from).startOf(unit).valueOf(),
                    to:  moment(self.to).startOf(unit).valueOf(),
                    intersects: function (timeStamp) {
                        return moment(timeStamp).valueOf() >= result.from && moment(timeStamp).valueOf() <= result.to;
                    }
                };
                return result;
            }
        };
        return self;
    }

    function timeResolutionFromLocal (selection, timeUnit) {
        var to, from, rangeObject;
        if (selection.duration && selection.duration.offset === 0) {
            to = moment();
            from = moment().startOf(selection.duration.unit).subtract(selection.duration.value - 1, selection.duration.unit);
        } else if (selection.duration && selection.duration.offset > 0) {
            var previousRange = new moment().subtract(selection.duration.offset, selection.duration.unit);
            var endOfPreviousRange = new moment().subtract(selection.duration.offset - 1, selection.duration.unit);
            from = moment(previousRange).startOf(selection.duration.unit);
            to = moment(endOfPreviousRange).startOf(selection.duration.unit);
        } else {
            to = moment();
            from = moment().subtract(selection.duration.value, selection.duration.unit);
        }
        rangeObject = timeResolution(from.valueOf(), to.valueOf());
        var unit = timeUnit || rangeObject.suggestedTimeUnit();
        rangeObject.to = moment(rangeObject.to).startOf(unit).valueOf();
        rangeObject.from = moment(rangeObject.to).subtract(selection.duration.value, selection.duration.unit).valueOf();
        rangeObject.timeUnit = unit;
        rangeObject.selectedRange = selection;
        return rangeObject;
    }

    function directive ($, _) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'dt-picker.html',
            scope: {
                range: '=',
                options: '=',
                rangeDictionary: '='
            },
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
                var internalSettingSingleDate;
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
                        var durationInHours = hourDifference(scope.internalRangeObject.from, scope.internalRangeObject.to);
                        scope.selectedDuration = _.find(scope.durations, { value: durationInHours, unit: 'hours' });
                    }

                    var fromDay = new Date(scope.internalRangeObject.suggestedRange().from);
                    internalSettingSingleDate = true;
                    $(element.find('.single-calendar-container')).datepick('setDate', fromDay);
                }

                /**
                 * After a user selects an option that represents a date range, e.g. 7 days, this function sets all date range controls accordingly.
                 */
                var internalSettingDateRange;
                function setupDateRange() {
                    var from = scope.internalRangeObject.suggestedRange().from;
                    var fromDay = new Date(from);
                    var fromMonth = moment(from).month();
                    var fromYear = moment(from).year();
                    var toDay = new Date(scope.internalRangeObject.suggestedRange().to);
                    rangeStarted = false;
                    internalSettingDateRange = true;
                    $(element.find('.double-calendar-container')).datepick('option', 'minDate', '-6m');
                    $(element.find('.double-calendar-container')).datepick('option', 'maxDate', +0);
                    $(element.find('.double-calendar-container')).datepick('setDate', fromDay, toDay);
                    $(element.find('.double-calendar-container')).datepick('showMonth', fromYear, fromMonth);
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
                                scope.internalRangeObject = timeResolution(from.valueOf(), to.valueOf());
                                scope.internalRangeObject.selectedRange = _.find(scope.dictionary, { custom: 'date' });
                                scope.isTimeRange = false;
                            }
                        } else {
                            if (!scope.isTimeRange) {
                                // In this case, single calendar needs to be initialized with a default range
                                var from = new moment(scope.internalRangeObject.from).startOf('day');
                                var to = new moment(scope.internalRangeObject.from).startOf('day').add(1, 'day');
                                scope.internalRangeObject = timeResolution(from.valueOf(), to.valueOf());
                                scope.internalRangeObject.selectedRange = _.find(scope.dictionary, { custom: 'time' });
                                scope.isTimeRange = true;
                            }
                        }
                    } else {
                        scope.internalRangeObject = timeResolutionFromLocal(scope.internalRangeObject.selectedRange, honorTimeUnit ? scope.internalRangeObject.timeUnit : false);
                        scope.isTimeRange = isTimeRange(scope.internalRangeObject.selectedRange);
                    }
                    if (!honorTimeUnit) {
                        scope.internalRangeObject.timeUnit = scope.internalRangeObject.suggestedTimeUnit();
                    }
                }

                function setupInternalRange (from, to, rangeOption) {
                    scope.internalRangeObject = timeResolution(from, to);
                    scope.internalRangeObject.selectedRange = _.find(scope.dictionary, rangeOption);
                    scope.internalRangeObject.timeUnit = scope.internalRangeObject.suggestedTimeUnit();
                }

                /**
                 * Executes when a user selects a date in the single calendar, updating internal range.
                 * @param dates
                 */
                scope.singleDateSelected = function (dates) {
                    if (!dates || !dates[0]) { return; }
                    if (internalSettingSingleDate) {
                        internalSettingSingleDate = false;
                        return;
                    }
                    var selection = new moment(dates[0]);
                    var newFrom = new moment(scope.internalRangeObject.from);
                    newFrom.year(selection.year()).month(selection.month()).date(selection.date());

                    var newTo = new moment(newFrom.valueOf()).add(scope.selectedDuration.value, 'hours');
                    setupInternalRange(newFrom.valueOf(), newTo.valueOf(), { custom: 'time' });
                    scope.$apply();
                };

                /**
                 * Executes when a user selects a date in the double calendar, updating internal range.
                 * When the user selects the first date on the range, it also updates available dates for range ending according to the maximum range allowed in days.
                 */
                var rangeStarted;
                scope.dateRangeSelected = function (dates) {
                    if (!dates || !dates.length) { return; }
                    if (internalSettingDateRange) {
                        internalSettingDateRange = false;
                        return;
                    }
                    var newFrom, newTo;

                    // Setting available dates according to max range configured
                    if (!rangeStarted) {
                        newFrom = moment(dates[0]).startOf('day').valueOf();
                        newTo = moment(dates[1]).endOf('day').valueOf();
                        rangeStarted = newFrom;
                        var maxRangeFromStart = moment(newFrom).add(scope.maxRange, 'days').valueOf();
                        var maxRangeOrToday = _.min([maxRangeFromStart, moment().valueOf()]);
//                            var initialMonthLabel = element.find('.datepick-month.first .datepick-month-header').text().split(' ')[0];
                        $(element.find('.double-calendar-container')).datepick('option', 'minDate', new Date(newFrom));
                        $(element.find('.double-calendar-container')).datepick('option', 'maxDate', new Date(maxRangeOrToday));
//                            var finalMonthLabel = element.find('.datepick-month.last .datepick-month-header').text().split(' ')[0];
                        //TODO: There is a problem when selecting a date from calendar, where calendars are moved while selecting a date. This partially fix that.
                    } else {
                        // Clearing available dates
                        newFrom = rangeStarted;
                        newTo = moment(dates[1]).endOf('day').valueOf();
                        $(element.find('.double-calendar-container')).datepick('option', 'minDate', '-6m');
                        $(element.find('.double-calendar-container')).datepick('option', 'maxDate', +0);
                        $(element.find('.double-calendar-container')).datepick('setDate', new Date(newFrom), new Date(newTo));
                        rangeStarted = false;
                    }
                    setupInternalRange(newFrom, newTo, { custom: 'date' });
                    setupAvailableTimeUnits(newFrom, newTo);
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
                    // Initializing calendars
                    $(element.find('.single-calendar-container')).datepick({
                        minDate: '-6m',
                        maxDate: +0,
                        changeMonth: false,
                        dayNamesMin : ["S", "M", "T", "W", "T", "F", "S"],
                        prevText: '<span class="datepickImagePrevious"></span><span class="datepickTextNextPrevious">Prev</span>',
                        nextText: '<span class="datepickTextNextPrevious">Next</span><span class="datepickImageNext"></span>',
                        onSelect: scope.singleDateSelected
                    });

                    $(element.find('.double-calendar-container')).datepick({
                        rangeSelect: true,
                        monthsToShow: 2,
                        minDate: '-6m',
                        maxDate: +0,
                        changeMonth: false,
                        dayNamesMin : ["S", "M", "T", "W", "T", "F", "S"],
                        prevText: '<span class="datepickImagePrevious"></span><span class="datepickTextNextPrevious">Prev</span>',
                        nextText: '<span class="datepickTextNextPrevious">Next</span><span class="datepickImageNext"></span>',
                        onSelect: scope.dateRangeSelected
                    });

                    // Initializing available options for ranges, starting hours and durations.
                    if (scope.rangeDictionary) { scope.dictionary = scope.rangeDictionary; }
                    else { scope.dictionary = defaultDictionary; }

                    if (_.find(scope.dictionary, { label: 'Last 10 Minutes'})) {
                        scope.hours = [{ value: -10, unit: 'minute', label: 'Ten minutes ago' }].concat(hours);
                        scope.durations = [{ value: 10, unit: 'minutes', label: '10 minutes' }].concat(durations);
                    } else {
                        scope.hours = hours;
                        scope.durations = durations;
                    }

                    if (scope.options && scope.options.hideCustom) {
                        _.remove(scope.dictionary, { custom: 'date' });
                    }
                    scope.maxRange = scope.options && scope.options.maxRange || 31;

                    // Initializing main internal object and controller range object, this will set initial range and main label.
                    scope.internalRangeObject = {};
                    scope.selectRangeOption(_.find(scope.dictionary, { preselected: true }) || scope.dictionary[0]);
                    scope.threeLetterTimezoneLabel = browserTimezone();
                    var range = timeResolutionFromLocal(scope.internalRangeObject.selectedRange);
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

    function createModule (angular, jQuery, lodash) {
        var module = angular.module('dt-picker', []);
        module.factory('jQuery', [function () { return jQuery; }]);
        module.factory('lodash', [function () { return lodash; }]);
        module.factory('dtPicker.service', [
            function () {
                return { version: '0.1.0' };
            }
        ]);
        module.directive('dtPicker', ['jQuery', 'lodash', directive]);
        return module;

//        angular.module('availability_board', []).factory('availability-service', function () { return createModule(angular); });
//        angular.module('availability_board').directive('availability-board', [directive]);
    }

    /*--------------------------------------------------------------------------*/

    // Verify if define is present as a function.
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        define(['angular', 'jQuery', 'datepick', 'lodash', 'moment', 'partials'], function(angular, jQuery, datepick, lodash, moment) {
            return createModule(angular, jQuery, _);
        });
    }
    else if ( typeof angular !== "undefined" && angular !== null ) {
        createModule(angular, $, _);
    }
}.call(this));

angular.module('partials', ['dt-picker.html']);

angular.module("dt-picker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("dt-picker.html",
    "<div class=\"date-time-picker\">\n" +
    "    <div class=\"picker-visible\">\n" +
    "        <div class=\"main-label-container left\">\n" +
    "            <a class=\"main-date-time-label\" ng-class=\"configuring ? 'configuring' : 'closed'\" ng-click=\"configure()\">\n" +
    "                <span class=\"dt-lighter\">{{ range.from | date: 'EEE' }}</span>\n" +
    "                <span class=\"dt-bolder\">{{ range.from | date: 'd MMM yyyy' }}</span>\n" +
    "                <span class=\"dt-lighter\">{{ range.from | date: 'H:mm' }}</span>\n" +
    "                <span class=\"dt-bolder\">&nbsp;&ndash;&nbsp;</span>\n" +
    "                <span class=\"dt-lighter\">{{ range.to | date: 'EEE' }}</span>\n" +
    "                <span class=\"dt-bolder\">{{ range.to | date: 'd MMM yyyy' }}</span>\n" +
    "                <span class=\"dt-lighter\">{{ range.to | date: 'H:mm' }}</span>\n" +
    "                <span class=\"dt-lighter\">{{ threeLetterTimezoneLabel }}</span>\n" +
    "            </a>\n" +
    "        </div>\n" +
    "        <div class=\"refresh-container right\">\n" +
    "            <button class=\"refresh-axdashboard btn btn-small\" href=\"\" ng-click=\"refresh()\"\n" +
    "                    analytics-on analytics-event=\"Analytics Dashboard Refresh\"><i class=\"icon-apigeeStyle icon-refresh\"></i></button>\n" +
    "        </div>\n" +
    "        <div class=\"clearfix\"></div>\n" +
    "    </div>\n" +
    "    <div class=\"date-time-configure\" ng-show=\"configuring\">\n" +
    "        <div class=\"sections\">\n" +
    "            <div class=\"date-range-selection\" ng-hide=\"isTimeRange\">\n" +
    "                <div class=\"double-calendar-container\"></div>\n" +
    "            </div>\n" +
    "            <div class=\"time-range-selection\" ng-show=\"isTimeRange\">\n" +
    "                <div class=\"single-calendar-container\"></div>\n" +
    "                <div class=\"time-range-container\">\n" +
    "                    <div class=\"key-value-section\">\n" +
    "                        <span class=\"bold-label\">From</span>\n" +
    "                        <div class=\"btn-group\">\n" +
    "                            <button class=\"btn btn-small dropdown-toggle\" data-toggle=\"dropdown\">{{ selectedFrom.label }}<span class=\"caret\"></span></button>\n" +
    "                            <ul class=\"dropdown-menu\">\n" +
    "                                <li ng-repeat=\"hour in hours\" ng-click=\"selectFrom(hour)\"><a>{{ hour.label }}</a></li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"key-value-section\">\n" +
    "                        <span class=\"bold-label\">Duration</span>\n" +
    "                        <div class=\"btn-group\">\n" +
    "                            <button class=\"btn btn-small dropdown-toggle\" data-toggle=\"dropdown\">{{ selectedDuration.label }}<span class=\"caret\"></span></button>\n" +
    "                            <ul class=\"dropdown-menu\">\n" +
    "                                <li ng-repeat=\"duration in durations\" ng-click=\"selectDuration(duration)\"><a>{{ duration.label }}</a></li>\n" +
    "                            </ul>\n" +
    "                        </div>\n" +
    "                    </div>\n" +
    "                    <div class=\"key-value-section\">\n" +
    "                        <span class=\"bold-label\">To</span>\n" +
    "                        <span class=\"label-text to-value\">{{ internalRangeObject.suggestedRange().to | date: 'H:mm' }}</span>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "            <div class=\"section-configure\">\n" +
    "                <div class=\"key-value-section\">\n" +
    "                    <span class=\"bold-label\">Range</span>\n" +
    "                    <div class=\"btn-group\">\n" +
    "                        <button class=\"btn btn-small dropdown-toggle\" data-toggle=\"dropdown\">{{ internalRangeObject.selectedRange.label }}<span class=\"caret\"></span></button>\n" +
    "                        <ul class=\"dropdown-menu\">\n" +
    "                            <li ng-repeat=\"range in dictionary\"><a ng-click=\"selectRangeOption(range)\">{{ range.label }}</a></li>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "                <div class=\"key-value-section\">\n" +
    "                    <span class=\"bold-label\">Time Unit</span>\n" +
    "                    <span class=\"label-text\" ng-hide=\"internalRangeObject.selectedRange.timeUnits.length > 1\">{{ internalRangeObject.timeUnit }}</span>\n" +
    "                    <div class=\"btn-group\" ng-show=\"internalRangeObject.selectedRange.timeUnits.length > 1\">\n" +
    "                        <button class=\"btn btn-small dropdown-toggle\" data-toggle=\"dropdown\">{{ internalRangeObject.timeUnit }}<span class=\"caret\"></span>\n" +
    "                        </button>\n" +
    "                        <ul class=\"dropdown-menu\">\n" +
    "                            <li ng-repeat=\"unit in internalRangeObject.selectedRange.timeUnits\" ng-click=\"selectTimeUnit(unit)\"><a>{{ unit }}</a></li>\n" +
    "                        </ul>\n" +
    "                    </div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "        <div class=\"bottom-section\">\n" +
    "            <div class=\"button-section\">\n" +
    "                <button class=\"btn btn-primary finish right\" ng-click=\"save()\">Apply</button>\n" +
    "                <button class=\"btn finish right\" ng-click=\"close()\">Cancel</button>\n" +
    "            </div>\n" +
    "            <div class=\"selected-section\">\n" +
    "                <span class=\"bold-label\">Selected</span>\n" +
    "                <span class=\"label-text\">{{ internalRangeObject.suggestedRange().from | date: 'EEE d MMM yyyy H:mm' }} &nbsp;&ndash;&nbsp; {{ internalRangeObject.suggestedRange().to | date: 'EEE d MMM yyyy H:mm' }} {{ threeLetterTimezoneLabel }}</span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>");
}]);
