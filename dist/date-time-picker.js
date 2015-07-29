/**
 * Another angular directive for selecting date and time ranges
 * @version v0.1.0 - 2015-07-28
 * @author Gabriela Vazquez <gabs.vz@gmail.com>
 **/
;(function () {
    'use strict';

    function directive ($, _, moment) {
        var defaultDictionary = [
            { label: 'Last Hour', duration: { unit: 'hour', value: 1 }},
            { label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }, preselected: true},
            { label: 'Yesterday', duration: { unit: 'day', value: 1, offset: 1 } }, // This needs an offset
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

        bootstrap($);

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'date-time-picker.html',
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
                    if (scope.options && scope.options.hideTimeUnit) {
                        scope.hideTimeUnit = true;
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

    function bootstrap($) {
        /*!
         * Bootstrap v3.3.5 (http://getbootstrap.com)
         * Copyright 2011-2015 Twitter, Inc.
         * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
         */

        /*!
         * Generated using the Bootstrap Customizer (http://getbootstrap.com/customize/?id=fb2f2b498dc3ed0d6db1)
         * Config saved to config.json and https://gist.github.com/fb2f2b498dc3ed0d6db1
         */
        if (typeof jQuery === 'undefined') {
            throw new Error('Bootstrap\'s JavaScript requires jQuery')
        }
        (function ($) {
            'use strict';
            var version = $.fn.jquery.split(' ')[0].split('.')
            if ((version[0] < 2 && version[1] < 9) || (version[0] == 1 && version[1] == 9 && version[2] < 1)) {
                throw new Error('Bootstrap\'s JavaScript requires jQuery version 1.9.1 or higher')
            }
        })(jQuery);

        /* ========================================================================
         * Bootstrap: dropdown.js v3.3.5
         * http://getbootstrap.com/javascript/#dropdowns
         * ========================================================================
         * Copyright 2011-2015 Twitter, Inc.
         * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
         * ======================================================================== */


        (function ($) {
            'use strict';

            // DROPDOWN CLASS DEFINITION
            // =========================

            var backdrop = '.dropdown-backdrop'
            var toggle   = '[data-toggle="dt_dropdown"]'
            var Dropdown = function (element) {
                $(element).on('click.dt.dropdown', this.toggle)
            }

            Dropdown.VERSION = '3.3.5'

            function getParent($this) {
                var selector = $this.attr('data-target')

                if (!selector) {
                    selector = $this.attr('href')
                    selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
                }

                var $parent = selector && $(selector)

                return $parent && $parent.length ? $parent : $this.parent()
            }

            function clearMenus(e) {
                if (e && e.which === 3) return
                $(backdrop).remove()
                $(toggle).each(function () {
                    var $this         = $(this)
                    var $parent       = getParent($this)
                    var relatedTarget = { relatedTarget: this }

                    if (!$parent.hasClass('open')) return

                    if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

                    $parent.trigger(e = $.Event('hide.dt.dropdown', relatedTarget))

                    if (e.isDefaultPrevented()) return

                    $this.attr('aria-expanded', 'false')
                    $parent.removeClass('open').trigger('hidden.dt.dropdown', relatedTarget)
                })
            }

            Dropdown.prototype.toggle = function (e) {
                var $this = $(this)

                if ($this.is('.disabled, :disabled')) return

                var $parent  = getParent($this)
                var isActive = $parent.hasClass('open')

                clearMenus()

                if (!isActive) {
                    if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                        // if mobile we use a backdrop because click events don't delegate
                        $(document.createElement('div'))
                            .addClass('dropdown-backdrop')
                            .insertAfter($(this))
                            .on('click', clearMenus)
                    }

                    var relatedTarget = { relatedTarget: this }
                    $parent.trigger(e = $.Event('show.dt.dropdown', relatedTarget))

                    if (e.isDefaultPrevented()) return

                    $this
                        .trigger('focus')
                        .attr('aria-expanded', 'true')

                    $parent
                        .toggleClass('open')
                        .trigger('shown.dt.dropdown', relatedTarget)
                }

                return false
            }

            Dropdown.prototype.keydown = function (e) {
                if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

                var $this = $(this)

                e.preventDefault()
                e.stopPropagation()

                if ($this.is('.disabled, :disabled')) return

                var $parent  = getParent($this)
                var isActive = $parent.hasClass('open')

                if (!isActive && e.which != 27 || isActive && e.which == 27) {
                    if (e.which == 27) $parent.find(toggle).trigger('focus')
                    return $this.trigger('click')
                }

                var desc = ' li:not(.disabled):visible a'
                var $items = $parent.find('.dropdown-menu' + desc)

                if (!$items.length) return

                var index = $items.index(e.target)

                if (e.which == 38 && index > 0)                 index--         // up
                if (e.which == 40 && index < $items.length - 1) index++         // down
                if (!~index)                                    index = 0

                $items.eq(index).trigger('focus')
            }


            // DROPDOWN PLUGIN DEFINITION
            // ==========================

            function Plugin(option) {
                return this.each(function () {
                    var $this = $(this)
                    var data  = $this.data('dt.dropdown')

                    if (!data) $this.data('dt.dropdown', (data = new Dropdown(this)))
                    if (typeof option == 'string') data[option].call($this)
                })
            }

            var old = $.fn.dt_dropdown;

            $.fn.dt_dropdown             = Plugin
            $.fn.dt_dropdown.Constructor = Dropdown


            // DROPDOWN NO CONFLICT
            // ====================

            $.fn.dt_dropdown.noConflict = function () {
                $.fn.dt_dropdown = old;
                return this
            }


            // APPLY TO STANDARD DROPDOWN ELEMENTS
            // ===================================

            $(document)
                .on('click.dt.dropdown.data-api', clearMenus)
                .on('click.dt.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
                .on('click.dt.dropdown.data-api', toggle, Dropdown.prototype.toggle)
                .on('keydown.dt.dropdown.data-api', toggle, Dropdown.prototype.keydown)
                .on('keydown.dt.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

        })(jQuery);
    }

    function createModule (angular, jQuery, lodash, moment) {
        injectDatepick(jQuery);
        var module = angular.module('dt-picker', []);
        module.run( ['$templateCache', preCacheTemplates] );
        module.factory('jQuery', [function () { return jQuery; }]);
        module.factory('lodash', [function () { return lodash; }]);
        module.factory('moment', [function () { return moment; }]);
        module.factory('dtPicker.service', [
            function () {
                return { version: '0.1.0' };
            }
        ]);
        module.directive('dtPicker', ['jQuery', 'lodash', 'moment', directive]);
        return module;
    }

    function preCacheTemplates ($templateCache) {     $templateCache.put('date-time-picker.html',
        '<div class="date-time-picker">\n' +
        '    <div>\n' +
        '        <div class="main-label-container">\n' +
        '            <a class="main-date-time-label" ng-class="configuring ? \'configuring\' : \'closed\'" ng-click="configure()">\n' +
        '                <span class="dt-lighter">{{ range.from | date: \'EEE\' }}</span>\n' +
        '                <span class="dt-bolder">{{ range.from | date: \'d MMM yyyy\' }}</span>\n' +
        '                <span class="dt-lighter">{{ range.from | date: \'H:mm\' }}</span>\n' +
        '                <span class="dt-bolder">&nbsp;&ndash;&nbsp;</span>\n' +
        '                <span class="dt-lighter">{{ range.to | date: \'EEE\' }}</span>\n' +
        '                <span class="dt-bolder">{{ range.to | date: \'d MMM yyyy\' }}</span>\n' +
        '                <span class="dt-lighter">{{ range.to | date: \'H:mm\' }}</span>\n' +
        '                <span class="dt-lighter">{{ threeLetterTimezoneLabel }}</span>\n' +
        '            </a>\n' +
        '        </div>\n' +
        '        <button class="btn-refresh btn btn-sm" href="" ng-click="refresh()"><i class="icon-refresh"></i></button>\n' +
        '        <div class="clearboth"></div>\n' +
        '    </div>\n' +
        '    <div class="date-time-configure" ng-show="configuring">\n' +
        '        <div class="sections">\n' +
        '            <div class="date-range-selection" ng-hide="isTimeRange">\n' +
        '                <div class="double-calendar-container"></div>\n' +
        '            </div>\n' +
        '            <div class="time-range-selection" ng-show="isTimeRange">\n' +
        '                <div class="single-calendar-container"></div>\n' +
        '                <div class="time-range-container">\n' +
        '                    <div class="key-value-section">\n' +
        '                        <span class="bold-label">From</span>\n' +
        '                        <div class="btn-group">\n' +
        '                            <button class="btn btn-sm dropdown-toggle" data-toggle="dt_dropdown">{{ selectedFrom.label }}<span class="caret"></span></button>\n' +
        '                            <ul class="dropdown-menu">\n' +
        '                                <li ng-repeat="hour in hours" ng-click="selectFrom(hour)"><a>{{ hour.label }}</a></li>\n' +
        '                            </ul>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                    <div class="key-value-section">\n' +
        '                        <span class="bold-label">Duration</span>\n' +
        '                        <div class="btn-group">\n' +
        '                            <button class="btn btn-sm dropdown-toggle" data-toggle="dt_dropdown">{{ selectedDuration.label }}<span class="caret"></span></button>\n' +
        '                            <ul class="dropdown-menu">\n' +
        '                                <li ng-repeat="duration in durations" ng-click="selectDuration(duration)"><a>{{ duration.label }}</a></li>\n' +
        '                            </ul>\n' +
        '                        </div>\n' +
        '                    </div>\n' +
        '                    <div class="key-value-section">\n' +
        '                        <span class="bold-label">To</span>\n' +
        '                        <span class="label-text to-value">{{ internalRangeObject.suggestedRange().to | date: \'H:mm\' }}</span>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '            <div class="section-configure">\n' +
        '                <div class="key-value-section">\n' +
        '                    <span class="bold-label">Range</span>\n' +
        '                    <div class="btn-group">\n' +
        '                        <button class="btn btn-sm dropdown-toggle" data-toggle="dt_dropdown">{{ internalRangeObject.selectedRange.label }}<span class="caret"></span></button>\n' +
        '                        <ul class="dropdown-menu">\n' +
        '                            <li ng-repeat="range in dictionary"><a ng-click="selectRangeOption(range)">{{ range.label }}</a></li>\n' +
        '                        </ul>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '                <div class="key-value-section" ng-hide="hideTimeUnit">\n' +
        '                    <span class="bold-label">Time Unit</span>\n' +
        '                    <span class="label-text" ng-hide="internalRangeObject.selectedRange.timeUnits.length > 1">{{ internalRangeObject.timeUnit }}</span>\n' +
        '                    <div class="btn-group" ng-show="internalRangeObject.selectedRange.timeUnits.length > 1">\n' +
        '                        <button class="btn btn-sm dropdown-toggle" data-toggle="dt_dropdown">{{ internalRangeObject.timeUnit }}<span class="caret"></span>\n' +
        '                        </button>\n' +
        '                        <ul class="dropdown-menu">\n' +
        '                            <li ng-repeat="unit in internalRangeObject.selectedRange.timeUnits" ng-click="selectTimeUnit(unit)"><a>{{ unit }}</a></li>\n' +
        '                        </ul>\n' +
        '                    </div>\n' +
        '                </div>\n' +
        '            </div>\n' +
        '        </div>\n' +
        '        <div class="bottom-section">\n' +
        '            <div class="button-section">\n' +
        '                <button class="btn btn-sm btn-save" ng-click="save()">Apply</button>\n' +
        '                <button class="btn btn-sm" ng-click="close()">Cancel</button>\n' +
        '            </div>\n' +
        '            <div class="selected-section">\n' +
        '                <span class="bold-label">Selected</span>\n' +
        '                <span class="label-text">{{ internalRangeObject.suggestedRange().from | date: \'EEE d MMM yyyy H:mm\' }} &nbsp;&ndash;&nbsp; {{ internalRangeObject.suggestedRange().to | date: \'EEE d MMM yyyy H:mm\' }} {{ threeLetterTimezoneLabel }}</span>\n' +
        '            </div>\n' +
        '            <div class="clearboth"></div>\n' +
        '        </div>\n' +
        '    </div>\n' +
        '</div>'); }
    function injectDatepick (jQuery) { 
/* http://keith-wood.name/datepick.html
   Date picker for jQuery v4.1.0.
   Written by Keith Wood (kbwood{at}iinet.com.au) February 2010.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* Datepicker manager. */
function Datepicker() {
	this._defaults = {
		pickerClass: '', // CSS class to add to this instance of the datepicker
		showOnFocus: true, // True for popup on focus, false for not
		showTrigger: null, // Element to be cloned for a trigger, null for none
		showAnim: 'show', // Name of jQuery animation for popup, '' for no animation
		showOptions: {}, // Options for enhanced animations
		showSpeed: 'normal', // Duration of display/closure
		popupContainer: null, // The element to which a popup calendar is added, null for body
		alignment: 'bottom', // Alignment of popup - with nominated corner of input:
			// 'top' or 'bottom' aligns depending on language direction,
			// 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
		fixedWeeks: false, // True to always show 6 weeks, false to only show as many as are needed
		firstDay: 0, // First day of the week, 0 = Sunday, 1 = Monday, ...
		calculateWeek: this.iso8601Week, // Calculate week of the year from a date, null for ISO8601
		monthsToShow: 1, // How many months to show, cols or [rows, cols]
		monthsOffset: 0, // How many months to offset the primary month by;
			// may be a function that takes the date and returns the offset
		monthsToStep: 1, // How many months to move when prev/next clicked
		monthsToJump: 12, // How many months to move when large prev/next clicked
		useMouseWheel: true, // True to use mousewheel if available, false to never use it
		changeMonth: true, // True to change month/year via drop-down, false for navigation only
		yearRange: 'c-10:c+10', // Range of years to show in drop-down: 'any' for direct text entry
			// or 'start:end', where start/end are '+-nn' for relative to today
			// or 'c+-nn' for relative to the currently selected date
			// or 'nnnn' for an absolute year
		shortYearCutoff: '+10', // Cutoff for two-digit year in the current century
		showOtherMonths: false, // True to show dates from other months, false to not show them
		selectOtherMonths: false, // True to allow selection of dates from other months too
		defaultDate: null, // Date to show if no other selected
		selectDefaultDate: false, // True to pre-select the default date if no other is chosen
		minDate: null, // The minimum selectable date
		maxDate: null, // The maximum selectable date
		dateFormat: 'mm/dd/yyyy', // Format for dates
		autoSize: false, // True to size the input field according to the date format
		rangeSelect: false, // Allows for selecting a date range on one date picker
		rangeSeparator: ' - ', // Text between two dates in a range
		multiSelect: 0, // Maximum number of selectable dates, zero for single select
		multiSeparator: ',', // Text between multiple dates
		onDate: null, // Callback as a date is added to the datepicker
		onShow: null, // Callback just before a datepicker is shown
		onChangeMonthYear: null, // Callback when a new month/year is selected
		onSelect: null, // Callback when a date is selected
		onClose: null, // Callback when a datepicker is closed
		altField: null, // Alternate field to update in synch with the datepicker
		altFormat: null, // Date format for alternate field, defaults to dateFormat
		constrainInput: true, // True to constrain typed input to dateFormat allowed characters
		commandsAsDateFormat: false, // True to apply formatDate to the command texts
		commands: this.commands // Command actions that may be added to a layout by name
	};
	this.regional = [];
	this.regional[''] = { // US/English
		monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'],
		monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		dateFormat: 'mm/dd/yyyy', // See options on formatDate
		firstDay: 0, // The first day of the week, Sun = 0, Mon = 1, ...
		renderer: this.defaultRenderer, // The rendering templates
		prevText: '&lt;Prev', // Text for the previous month command
		prevStatus: 'Show the previous month', // Status text for the previous month command
		prevJumpText: '&lt;&lt;', // Text for the previous year command
		prevJumpStatus: 'Show the previous year', // Status text for the previous year command
		nextText: 'Next&gt;', // Text for the next month command
		nextStatus: 'Show the next month', // Status text for the next month command
		nextJumpText: '&gt;&gt;', // Text for the next year command
		nextJumpStatus: 'Show the next year', // Status text for the next year command
		currentText: 'Current', // Text for the current month command
		currentStatus: 'Show the current month', // Status text for the current month command
		todayText: 'Today', // Text for the today's month command
		todayStatus: 'Show today\'s month', // Status text for the today's month command
		clearText: 'Clear', // Text for the clear command
		clearStatus: 'Clear all the dates', // Status text for the clear command
		closeText: 'Close', // Text for the close command
		closeStatus: 'Close the datepicker', // Status text for the close command
		yearStatus: 'Change the year', // Status text for year selection
		monthStatus: 'Change the month', // Status text for month selection
		weekText: 'Wk', // Text for week of the year column header
		weekStatus: 'Week of the year', // Status text for week of the year column header
		dayStatus: 'Select DD, M d, yyyy', // Status text for selectable days
		defaultStatus: 'Select a date', // Status text shown by default
		isRTL: false // True if language is right-to-left
	};
	$.extend(this._defaults, this.regional['']);
	this._disabled = [];
}

$.extend(Datepicker.prototype, {
	/* Class name added to elements to indicate already configured with datepicker. */
	markerClassName: 'hasDatepick',
	/* Name of the data property for instance settings. */
	propertyName: 'datepick',

	_popupClass: 'datepick-popup', // Marker for popup division
	_triggerClass: 'datepick-trigger', // Marker for trigger element
	_disableClass: 'datepick-disable', // Marker for disabled element
	_monthYearClass: 'datepick-month-year', // Marker for month/year inputs
	_curMonthClass: 'datepick-month-', // Marker for current month/year
	_anyYearClass: 'datepick-any-year', // Marker for year direct input
	_curDoWClass: 'datepick-dow-', // Marker for day of week
	
	commands: { // Command actions that may be added to a layout by name
		// name: { // The command name, use '{button:name}' or '{link:name}' in layouts
		//		text: '', // The field in the regional settings for the displayed text
		//		status: '', // The field in the regional settings for the status text
		//      // The keystroke to trigger the action
		//		keystroke: {keyCode: nn, ctrlKey: boolean, altKey: boolean, shiftKey: boolean},
		//		enabled: fn, // The function that indicates the command is enabled
		//		date: fn, // The function to get the date associated with this action
		//		action: fn} // The function that implements the action
		prev: {text: 'prevText', status: 'prevStatus', // Previous month
			keystroke: {keyCode: 33}, // Page up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || plugin.add(plugin.day(
					plugin._applyMonthsOffset(plugin.add(plugin.newDate(inst.drawDate),
					1 - inst.options.monthsToStep, 'm'), inst), 1), -1, 'd').
					getTime() >= minDate.getTime()); },
			date: function(inst) {
				return plugin.day(plugin._applyMonthsOffset(plugin.add(
					plugin.newDate(inst.drawDate), -inst.options.monthsToStep, 'm'), inst), 1); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, -inst.options.monthsToStep); }
		},
		prevJump: {text: 'prevJumpText', status: 'prevJumpStatus', // Previous year
			keystroke: {keyCode: 33, ctrlKey: true}, // Ctrl + Page up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || plugin.add(plugin.day(
					plugin._applyMonthsOffset(plugin.add(plugin.newDate(inst.drawDate),
					1 - inst.options.monthsToJump, 'm'), inst), 1), -1, 'd').
					getTime() >= minDate.getTime()); },
			date: function(inst) {
				return plugin.day(plugin._applyMonthsOffset(plugin.add(
					plugin.newDate(inst.drawDate), -inst.options.monthsToJump, 'm'), inst), 1); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, -inst.options.monthsToJump); }
		},
		next: {text: 'nextText', status: 'nextStatus', // Next month
			keystroke: {keyCode: 34}, // Page down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || plugin.day(plugin._applyMonthsOffset(plugin.add(
					plugin.newDate(inst.drawDate), inst.options.monthsToStep, 'm'), inst), 1).
					getTime() <= maxDate.getTime()); },
			date: function(inst) {
				return plugin.day(plugin._applyMonthsOffset(plugin.add(
					plugin.newDate(inst.drawDate), inst.options.monthsToStep, 'm'), inst), 1); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, inst.options.monthsToStep); }
		},
		nextJump: {text: 'nextJumpText', status: 'nextJumpStatus', // Next year
			keystroke: {keyCode: 34, ctrlKey: true}, // Ctrl + Page down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || plugin.day(plugin._applyMonthsOffset(plugin.add(
					plugin.newDate(inst.drawDate), inst.options.monthsToJump, 'm'), inst), 1).
					getTime() <= maxDate.getTime()); },
			date: function(inst) {
				return plugin.day(plugin._applyMonthsOffset(plugin.add(
					plugin.newDate(inst.drawDate), inst.options.monthsToJump, 'm'), inst), 1); },
			action: function(inst) {
				plugin._changeMonthPlugin(this, inst.options.monthsToJump); }
		},
		current: {text: 'currentText', status: 'currentStatus', // Current month
			keystroke: {keyCode: 36, ctrlKey: true}, // Ctrl + Home
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				var maxDate = inst.get('maxDate');
				var curDate = inst.selectedDates[0] || plugin.today();
				return (!minDate || curDate.getTime() >= minDate.getTime()) &&
					(!maxDate || curDate.getTime() <= maxDate.getTime()); },
			date: function(inst) {
				return inst.selectedDates[0] || plugin.today(); },
			action: function(inst) {
				var curDate = inst.selectedDates[0] || plugin.today();
				plugin._showMonthPlugin(this, curDate.getFullYear(), curDate.getMonth() + 1); }
		},
		today: {text: 'todayText', status: 'todayStatus', // Today's month
			keystroke: {keyCode: 36, ctrlKey: true}, // Ctrl + Home
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				var maxDate = inst.get('maxDate');
				return (!minDate || plugin.today().getTime() >= minDate.getTime()) &&
					(!maxDate || plugin.today().getTime() <= maxDate.getTime()); },
			date: function(inst) { return plugin.today(); },
			action: function(inst) { plugin._showMonthPlugin(this); }
		},
		clear: {text: 'clearText', status: 'clearStatus', // Clear the datepicker
			keystroke: {keyCode: 35, ctrlKey: true}, // Ctrl + End
			enabled: function(inst) { return true; },
			date: function(inst) { return null; },
			action: function(inst) { plugin._clearPlugin(this); }
		},
		close: {text: 'closeText', status: 'closeStatus', // Close the datepicker
			keystroke: {keyCode: 27}, // Escape
			enabled: function(inst) { return true; },
			date: function(inst) { return null; },
			action: function(inst) { plugin._hidePlugin(this); }
		},
		prevWeek: {text: 'prevWeekText', status: 'prevWeekStatus', // Previous week
			keystroke: {keyCode: 38, ctrlKey: true}, // Ctrl + Up
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || plugin.add(plugin.newDate(inst.drawDate), -7, 'd').
					getTime() >= minDate.getTime()); },
			date: function(inst) { return plugin.add(plugin.newDate(inst.drawDate), -7, 'd'); },
			action: function(inst) { plugin._changeDayPlugin(this, -7); }
		},
		prevDay: {text: 'prevDayText', status: 'prevDayStatus', // Previous day
			keystroke: {keyCode: 37, ctrlKey: true}, // Ctrl + Left
			enabled: function(inst) {
				var minDate = inst.curMinDate();
				return (!minDate || plugin.add(plugin.newDate(inst.drawDate), -1, 'd').
					getTime() >= minDate.getTime()); },
			date: function(inst) { return plugin.add(plugin.newDate(inst.drawDate), -1, 'd'); },
			action: function(inst) { plugin._changeDayPlugin(this, -1); }
		},
		nextDay: {text: 'nextDayText', status: 'nextDayStatus', // Next day
			keystroke: {keyCode: 39, ctrlKey: true}, // Ctrl + Right
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || plugin.add(plugin.newDate(inst.drawDate), 1, 'd').
					getTime() <= maxDate.getTime()); },
			date: function(inst) { return plugin.add(plugin.newDate(inst.drawDate), 1, 'd'); },
			action: function(inst) { plugin._changeDayPlugin(this, 1); }
		},
		nextWeek: {text: 'nextWeekText', status: 'nextWeekStatus', // Next week
			keystroke: {keyCode: 40, ctrlKey: true}, // Ctrl + Down
			enabled: function(inst) {
				var maxDate = inst.get('maxDate');
				return (!maxDate || plugin.add(plugin.newDate(inst.drawDate), 7, 'd').
					getTime() <= maxDate.getTime()); },
			date: function(inst) { return plugin.add(plugin.newDate(inst.drawDate), 7, 'd'); },
			action: function(inst) { plugin._changeDayPlugin(this, 7); }
		}
	},

	/* Default template for generating a datepicker. */
	defaultRenderer: {
		// Anywhere: '{l10n:name}' to insert localised value for name,
		// '{link:name}' to insert a link trigger for command name,
		// '{button:name}' to insert a button trigger for command name,
		// '{popup:start}...{popup:end}' to mark a section for inclusion in a popup datepicker only,
		// '{inline:start}...{inline:end}' to mark a section for inclusion in an inline datepicker only
		// Overall structure: '{months}' to insert calendar months
		picker: '<div class="datepick">' +
		'<div class="datepick-nav">{link:prev}{link:today}{link:next}</div>{months}' +
		'{popup:start}<div class="datepick-ctrl">{link:clear}{link:close}</div>{popup:end}' +
		'<div class="datepick-clear-fix"></div></div>',
		// One row of months: '{months}' to insert calendar months
		monthRow: '<div class="datepick-month-row">{months}</div>',
		// A single month: '{monthHeader:dateFormat}' to insert the month header -
		// dateFormat is optional and defaults to 'MM yyyy',
		// '{weekHeader}' to insert a week header, '{weeks}' to insert the month's weeks
		month: '<div class="datepick-month"><div class="datepick-month-header">{monthHeader}</div>' +
		'<table><thead>{weekHeader}</thead><tbody>{weeks}</tbody></table></div>',
		// A week header: '{days}' to insert individual day names
		weekHeader: '<tr>{days}</tr>',
		// Individual day header: '{day}' to insert day name
		dayHeader: '<th>{day}</th>',
		// One week of the month: '{days}' to insert the week's days, '{weekOfYear}' to insert week of year
		week: '<tr>{days}</tr>',
		// An individual day: '{day}' to insert day value
		day: '<td>{day}</td>',
		// jQuery selector, relative to picker, for a single month
		monthSelector: '.datepick-month',
		// jQuery selector, relative to picker, for individual days
		daySelector: 'td',
		// Class for right-to-left (RTL) languages
		rtlClass: 'datepick-rtl',
		// Class for multi-month datepickers
		multiClass: 'datepick-multi',
		// Class for selectable dates
		defaultClass: '',
		// Class for currently selected dates
		selectedClass: 'datepick-selected',
		// Class for highlighted dates
		highlightedClass: 'datepick-highlight',
		// Class for today
		todayClass: 'datepick-today',
		// Class for days from other months
		otherMonthClass: 'datepick-other-month',
		// Class for days on weekends
		weekendClass: 'datepick-weekend',
		// Class prefix for commands
		commandClass: 'datepick-cmd',
		// Extra class(es) for commands that are buttons
		commandButtonClass: '',
		// Extra class(es) for commands that are links
		commandLinkClass: '',
		// Class for disabled commands
		disabledClass: 'datepick-disabled'
	},

	/* Override the default settings for all datepicker instances.
	   @param  options  (object) the new settings to use as defaults
	   @return  (Datepicker) this object */
	setDefaults: function(options) {
		$.extend(this._defaults, options || {});
		return this;
	},

	_ticksTo1970: (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
		Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000),
	_msPerDay: 24 * 60 * 60 * 1000,

	ATOM: 'yyyy-mm-dd', // RFC 3339/ISO 8601
	COOKIE: 'D, dd M yyyy',
	FULL: 'DD, MM d, yyyy',
	ISO_8601: 'yyyy-mm-dd',
	JULIAN: 'J',
	RFC_822: 'D, d M yy',
	RFC_850: 'DD, dd-M-yy',
	RFC_1036: 'D, d M yy',
	RFC_1123: 'D, d M yyyy',
	RFC_2822: 'D, d M yyyy',
	RSS: 'D, d M yy', // RFC 822
	TICKS: '!',
	TIMESTAMP: '@',
	W3C: 'yyyy-mm-dd', // ISO 8601

	/* Format a date object into a string value.
	   The format can be combinations of the following:
	   d  - day of month (no leading zero)
	   dd - day of month (two digit)
	   o  - day of year (no leading zeros)
	   oo - day of year (three digit)
	   D  - day name short
	   DD - day name long
	   w  - week of year (no leading zero)
	   ww - week of year (two digit)
	   m  - month of year (no leading zero)
	   mm - month of year (two digit)
	   M  - month name short
	   MM - month name long
	   yy - year (two digit)
	   yyyy - year (four digit)
	   @  - Unix timestamp (s since 01/01/1970)
	   !  - Windows ticks (100ns since 01/01/0001)
	   '...' - literal text
	   '' - single quote
	   @param  format    (string) the desired format of the date (optional, default datepicker format)
	   @param  date      (Date) the date value to format
	   @param  settings  (object) attributes include:
	                     dayNamesShort    (string[]) abbreviated names of the days from Sunday (optional)
	                     dayNames         (string[]) names of the days from Sunday (optional)
	                     monthNamesShort  (string[]) abbreviated names of the months (optional)
	                     monthNames       (string[]) names of the months (optional)
						 calculateWeek    (function) function that determines week of the year (optional)
	   @return  (string) the date in the above format */
	formatDate: function(format, date, settings) {
		if (typeof format != 'string') {
			settings = date;
			date = format;
			format = '';
		}
		if (!date) {
			return '';
		}
		format = format || this._defaults.dateFormat;
		settings = settings || {};
		var dayNamesShort = settings.dayNamesShort || this._defaults.dayNamesShort;
		var dayNames = settings.dayNames || this._defaults.dayNames;
		var monthNamesShort = settings.monthNamesShort || this._defaults.monthNamesShort;
		var monthNames = settings.monthNames || this._defaults.monthNames;
		var calculateWeek = settings.calculateWeek || this._defaults.calculateWeek;
		// Check whether a format character is doubled
		var doubled = function(match, step) {
			var matches = 1;
			while (iFormat + matches < format.length && format.charAt(iFormat + matches) == match) {
				matches++;
			}
			iFormat += matches - 1;
			return Math.floor(matches / (step || 1)) > 1;
		};
		// Format a number, with leading zeroes if necessary
		var formatNumber = function(match, value, len, step) {
			var num = '' + value;
			if (doubled(match, step)) {
				while (num.length < len) {
					num = '0' + num;
				}
			}
			return num;
		};
		// Format a name, short or long as requested
		var formatName = function(match, value, shortNames, longNames) {
			return (doubled(match) ? longNames[value] : shortNames[value]);
		};
		var output = '';
		var literal = false;
		for (var iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) == "'" && !doubled("'")) {
					literal = false;
				}
				else {
					output += format.charAt(iFormat);
				}
			}
			else {
				switch (format.charAt(iFormat)) {
					case 'd': output += formatNumber('d', date.getDate(), 2); break;
					case 'D': output += formatName('D', date.getDay(),
						dayNamesShort, dayNames); break;
					case 'o': output += formatNumber('o', this.dayOfYear(date), 3); break;
					case 'w': output += formatNumber('w', calculateWeek(date), 2); break;
					case 'm': output += formatNumber('m', date.getMonth() + 1, 2); break;
					case 'M': output += formatName('M', date.getMonth(),
						monthNamesShort, monthNames); break;
					case 'y':
						output += (doubled('y', 2) ? date.getFullYear() :
							(date.getFullYear() % 100 < 10 ? '0' : '') + date.getFullYear() % 100);
						break;
					case '@': output += Math.floor(date.getTime() / 1000); break;
					case '!': output += date.getTime() * 10000 + this._ticksTo1970; break;
					case "'":
						if (doubled("'")) {
							output += "'";
						}
						else {
							literal = true;
						}
						break;
					default:
						output += format.charAt(iFormat);
				}
			}
		}
		return output;
	},

	/* Parse a string value into a date object.
	   See formatDate for the possible formats, plus:
	   * - ignore rest of string
	   @param  format    (string) the expected format of the date ('' for default datepicker format)
	   @param  value     (string) the date in the above format
	   @param  settings  (object) attributes include:
	                     shortYearCutoff  (number) the cutoff year for determining the century (optional)
	                     dayNamesShort    (string[]) abbreviated names of the days from Sunday (optional)
	                     dayNames         (string[]) names of the days from Sunday (optional)
	                     monthNamesShort  (string[]) abbreviated names of the months (optional)
	                     monthNames       (string[]) names of the months (optional)
	   @return  (Date) the extracted date value or null if value is blank
	   @throws  errors if the format and/or value are missing,
	            if the value doesn't match the format,
	            or if the date is invalid */
	parseDate: function(format, value, settings) {
		if (value == null) {
			throw 'Invalid arguments';
		}
		value = (typeof value == 'object' ? value.toString() : value + '');
		if (value == '') {
			return null;
		}
		format = format || this._defaults.dateFormat;
		settings = settings || {};
		var shortYearCutoff = settings.shortYearCutoff || this._defaults.shortYearCutoff;
		shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff :
			this.today().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
		var dayNamesShort = settings.dayNamesShort || this._defaults.dayNamesShort;
		var dayNames = settings.dayNames || this._defaults.dayNames;
		var monthNamesShort = settings.monthNamesShort || this._defaults.monthNamesShort;
		var monthNames = settings.monthNames || this._defaults.monthNames;
		var year = -1;
		var month = -1;
		var day = -1;
		var doy = -1;
		var shortYear = false;
		var literal = false;
		// Check whether a format character is doubled
		var doubled = function(match, step) {
			var matches = 1;
			while (iFormat + matches < format.length && format.charAt(iFormat + matches) == match) {
				matches++;
			}
			iFormat += matches - 1;
			return Math.floor(matches / (step || 1)) > 1;
		};
		// Extract a number from the string value
		var getNumber = function(match, step) {
			var isDoubled = doubled(match, step);
			var size = [2, 3, isDoubled ? 4 : 2, 11, 20]['oy@!'.indexOf(match) + 1];
			var digits = new RegExp('^-?\\d{1,' + size + '}');
			var num = value.substring(iValue).match(digits);
			if (!num) {
				throw 'Missing number at position {0}'.replace(/\{0\}/, iValue);
			}
			iValue += num[0].length;
			return parseInt(num[0], 10);
		};
		// Extract a name from the string value and convert to an index
		var getName = function(match, shortNames, longNames, step) {
			var names = (doubled(match, step) ? longNames : shortNames);
			for (var i = 0; i < names.length; i++) {
				if (value.substr(iValue, names[i].length).toLowerCase() == names[i].toLowerCase()) {
					iValue += names[i].length;
					return i + 1;
				}
			}
			throw 'Unknown name at position {0}'.replace(/\{0\}/, iValue);
		};
		// Confirm that a literal character matches the string value
		var checkLiteral = function() {
			if (value.charAt(iValue) != format.charAt(iFormat)) {
				throw 'Unexpected literal at position {0}'.replace(/\{0\}/, iValue);
			}
			iValue++;
		};
		var iValue = 0;
		for (var iFormat = 0; iFormat < format.length; iFormat++) {
			if (literal) {
				if (format.charAt(iFormat) == "'" && !doubled("'")) {
					literal = false;
				}
				else {
					checkLiteral();
				}
			}
			else {
				switch (format.charAt(iFormat)) {
					case 'd': day = getNumber('d'); break;
					case 'D': getName('D', dayNamesShort, dayNames); break;
					case 'o': doy = getNumber('o'); break;
					case 'w': getNumber('w'); break;
					case 'm': month = getNumber('m'); break;
					case 'M': month = getName('M', monthNamesShort, monthNames); break;
					case 'y':
						var iSave = iFormat;
						shortYear = !doubled('y', 2);
						iFormat = iSave;
						year = getNumber('y', 2);
						break;
					case '@':
						var date = this._normaliseDate(new Date(getNumber('@') * 1000));
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case '!':
						var date = this._normaliseDate(
							new Date((getNumber('!') - this._ticksTo1970) / 10000));
						year = date.getFullYear();
						month = date.getMonth() + 1;
						day = date.getDate();
						break;
					case '*': iValue = value.length; break;
					case "'":
						if (doubled("'")) {
							checkLiteral();
						}
						else {
							literal = true;
						}
						break;
					default: checkLiteral();
				}
			}
		}
		if (iValue < value.length) {
			throw 'Additional text found at end';
		}
		if (year == -1) {
			year = this.today().getFullYear();
		}
		else if (year < 100 && shortYear) {
			year += (shortYearCutoff == -1 ? 1900 : this.today().getFullYear() -
				this.today().getFullYear() % 100 - (year <= shortYearCutoff ? 0 : 100));
		}
		if (doy > -1) {
			month = 1;
			day = doy;
			for (var dim = this.daysInMonth(year, month); day > dim;
					dim = this.daysInMonth(year, month)) {
				month++;
				day -= dim;
			}
		}
		var date = this.newDate(year, month, day);
		if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day) {
			throw 'Invalid date';
		}
		return date;
	},

	/* A date may be specified as an exact value or a relative one.
	   @param  dateSpec     (Date or number or string) the date as an object or string
	                        in the given format or an offset - numeric days from today,
	                        or string amounts and periods, e.g. '+1m +2w'
	   @param  defaultDate  (Date) the date to use if no other supplied, may be null
	   @param  currentDate  (Date) the current date as a possible basis for relative dates,
	                        if null today is used (optional)
	   @param  dateFormat   (string) the expected date format - see formatDate above (optional)
	   @param  settings     (object) attributes include:
	                        shortYearCutoff  (number) the cutoff year for determining the century (optional)
	                        dayNamesShort    (string[7]) abbreviated names of the days from Sunday (optional)
	                        dayNames         (string[7]) names of the days from Sunday (optional)
	                        monthNamesShort  (string[12]) abbreviated names of the months (optional)
	                        monthNames       (string[12]) names of the months (optional)
	   @return  (Date) the decoded date */
	determineDate: function(dateSpec, defaultDate, currentDate, dateFormat, settings) {
		if (currentDate && typeof currentDate != 'object') {
			settings = dateFormat;
			dateFormat = currentDate;
			currentDate = null;
		}
		if (typeof dateFormat != 'string') {
			settings = dateFormat;
			dateFormat = '';
		}
		var offsetString = function(offset) {
			try {
				return plugin.parseDate(dateFormat, offset, settings);
			}
			catch (e) {
				// Ignore
			}
			offset = offset.toLowerCase();
			var date = (offset.match(/^c/) && currentDate ? plugin.newDate(currentDate) : null) ||
				plugin.today();
			var pattern = /([+-]?[0-9]+)\s*(d|w|m|y)?/g;
			var matches = null;
			while (matches = pattern.exec(offset)) {
				date = plugin.add(date, parseInt(matches[1], 10), matches[2] || 'd');
			}
			return date;
		};
		defaultDate = (defaultDate ? plugin.newDate(defaultDate) : null);
		dateSpec = (dateSpec == null ? defaultDate :
			(typeof dateSpec == 'string' ? offsetString(dateSpec) : (typeof dateSpec == 'number' ?
			(isNaN(dateSpec) || dateSpec == Infinity || dateSpec == -Infinity ? defaultDate :
			plugin.add(plugin.today(), dateSpec, 'd')) : plugin.newDate(dateSpec))));
		return dateSpec;
	},

	/* Find the number of days in a given month.
	   @param  year   (Date) the date to get days for or
	                  (number) the full year
	   @param  month  (number) the month (1 to 12)
	   @return  (number) the number of days in this month */
	daysInMonth: function(year, month) {
		month = (year.getFullYear ? year.getMonth() + 1 : month);
		year = (year.getFullYear ? year.getFullYear() : year);
		return this.newDate(year, month + 1, 0).getDate();
	},

	/* Calculate the day of the year for a date.
	   @param  year   (Date) the date to get the day-of-year for or
	                  (number) the full year
	   @param  month  (number) the month (1-12)
	   @param  day    (number) the day
	   @return  (number) the day of the year */
	dayOfYear: function(year, month, day) {
		var date = (year.getFullYear ? year : this.newDate(year, month, day));
		var newYear = this.newDate(date.getFullYear(), 1, 1);
		return Math.floor((date.getTime() - newYear.getTime()) / this._msPerDay) + 1;
	},

	/* Set as calculateWeek to determine the week of the year based on the ISO 8601 definition.
	   @param  year   (Date) the date to get the week for or
	                  (number) the full year
	   @param  month  (number) the month (1-12)
	   @param  day    (number) the day
	   @return  (number) the number of the week within the year that contains this date */
	iso8601Week: function(year, month, day) {
		var checkDate = (year.getFullYear ?
			new Date(year.getTime()) : this.newDate(year, month, day));
		// Find Thursday of this week starting on Monday
		checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
		var time = checkDate.getTime();
		checkDate.setMonth(0, 1); // Compare with Jan 1
		return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
	},

	/* Return today's date.
	   @return  (Date) today */
	today: function() {
		return this._normaliseDate(new Date());
	},

	/* Return a new date.
	   @param  year   (Date) the date to clone or
					  (number) the year
	   @param  month  (number) the month (1-12)
	   @param  day    (number) the day
	   @return  (Date) the date */
	newDate: function(year, month, day) {
		return (!year ? null : (year.getFullYear ? this._normaliseDate(new Date(year.getTime())) :
			new Date(year, month - 1, day, 12)));
	},

	/* Standardise a date into a common format - time portion is 12 noon.
	   @param  date  (Date) the date to standardise
	   @return  (Date) the normalised date */
	_normaliseDate: function(date) {
		if (date) {
			date.setHours(12, 0, 0, 0);
		}
		return date;
	},

	/* Set the year for a date.
	   @param  date  (Date) the original date
	   @param  year  (number) the new year
	   @return  the updated date */
	year: function(date, year) {
		date.setFullYear(year);
		return this._normaliseDate(date);
	},

	/* Set the month for a date.
	   @param  date   (Date) the original date
	   @param  month  (number) the new month (1-12)
	   @return  the updated date */
	month: function(date, month) {
		date.setMonth(month - 1);
		return this._normaliseDate(date);
	},

	/* Set the day for a date.
	   @param  date  (Date) the original date
	   @param  day   (number) the new day of the month
	   @return  the updated date */
	day: function(date, day) {
		date.setDate(day);
		return this._normaliseDate(date);
	},

	/* Add a number of periods to a date.
	   @param  date    (Date) the original date
	   @param  amount  (number) the number of periods
	   @param  period  (string) the type of period d/w/m/y
	   @return  the updated date */
	add: function(date, amount, period) {
		if (period == 'd' || period == 'w') {
			this._normaliseDate(date);
			date.setDate(date.getDate() + amount * (period == 'w' ? 7 : 1));
		}
		else {
			var year = date.getFullYear() + (period == 'y' ? amount : 0);
			var month = date.getMonth() + (period == 'm' ? amount : 0);
			date.setTime(plugin.newDate(year, month + 1,
				Math.min(date.getDate(), this.daysInMonth(year, month + 1))).getTime());
		}
		return date;
	},

	/* Apply the months offset value to a date.
	   @param  date  (Date) the original date
	   @param  inst  (object) the current instance settings
	   @return  (Date) the updated date */
	_applyMonthsOffset: function(date, inst) {
		var monthsOffset = inst.options.monthsOffset;
		if ($.isFunction(monthsOffset)) {
			monthsOffset = monthsOffset.apply(inst.target[0], [date]);
		}
		return plugin.add(date, -monthsOffset, 'm');
	},

	/* Attach the datepicker functionality to an input field.
	   @param  target   (element) the control to affect
	   @param  options  (object) the custom options for this instance */
	_attachPlugin: function(target, options) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		var inlineSettings = ($.fn.metadata ? target.metadata() : {});
		var inst = {options: $.extend({}, this._defaults, inlineSettings, options),
			target: target, selectedDates: [], drawDate: null, pickingRange: false,
			inline: ($.inArray(target[0].nodeName.toLowerCase(), ['div', 'span']) > -1),
			get: function(name) { // Get a setting value, computing if necessary
				if ($.inArray(name, ['defaultDate', 'minDate', 'maxDate']) > -1) { // Decode date settings
					return plugin.determineDate(this.options[name], null,
						this.selectedDates[0], this.options.dateFormat, inst.getConfig());
				}
				return this.options[name];
			},
			curMinDate: function() {
				return (this.pickingRange ? this.selectedDates[0] : this.get('minDate'));
			},
			getConfig: function() {
				return {dayNamesShort: this.options.dayNamesShort, dayNames: this.options.dayNames,
					monthNamesShort: this.options.monthNamesShort, monthNames: this.options.monthNames,
					calculateWeek: this.options.calculateWeek,
					shortYearCutoff: this.options.shortYearCutoff};
			}
		};
		target.addClass(this.markerClassName).data(this.propertyName, inst);
		if (inst.inline) {
			inst.drawDate = plugin._checkMinMax(plugin.newDate(inst.selectedDates[0] ||
				inst.get('defaultDate') || plugin.today()), inst);
			inst.prevDate = plugin.newDate(inst.drawDate);
			this._update(target[0]);
			if ($.fn.mousewheel) {
				target.mousewheel(this._doMouseWheel);
			}
		}
		else {
			this._attachments(target, inst);
			target.bind('keydown.' + this.propertyName, this._keyDown).
				bind('keypress.' + this.propertyName, this._keyPress).
				bind('keyup.' + this.propertyName, this._keyUp);
			if (target.attr('disabled')) {
				this._disablePlugin(target[0]);
			}
		}
	},

	/* Retrieve or reconfigure the settings for a control.
	   @param  target   (element) the control to affect
	   @param  options  (object) the new options for this instance or
	                    (string) an individual property name
	   @param  value    (any) the individual property value (omit if options
	                    is an object or to retrieve the value of a setting)
	   @return  (any) if retrieving a value */
	_optionPlugin: function(target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if (!options || (typeof options == 'string' && value == null)) { // Get option
			var name = options;
			options = (inst || {}).options;
			return (options && name ? options[name] : options);
		}

		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		options = options || {};
		if (typeof options == 'string') {
			var name = options;
			options = {};
			options[name] = value;
		}
		if (options.calendar && options.calendar != inst.options.calendar) {
			var discardDate = function(name) {
				return (typeof inst.options[name] == 'object' ? null : inst.options[name]);
			};
			options = $.extend({defaultDate: discardDate('defaultDate'),
				minDate: discardDate('minDate'), maxDate: discardDate('maxDate')}, options);
			inst.selectedDates = [];
			inst.drawDate = null;
		}
		var dates = inst.selectedDates;
		$.extend(inst.options, options);
		this._setDatePlugin(target[0], dates, null, false, true);
		inst.pickingRange = false;
		inst.drawDate = plugin.newDate(this._checkMinMax(
			(inst.options.defaultDate ? inst.get('defaultDate') : inst.drawDate) ||
			inst.get('defaultDate') || plugin.today(), inst));
		if (!inst.inline) {
			this._attachments(target, inst);
		}
		if (inst.inline || inst.div) {
			this._update(target[0]);
		}
	},

	/* Attach events and trigger, if necessary.
	   @param  target  (jQuery) the control to affect
	   @param  inst    (object) the current instance settings */
	_attachments: function(target, inst) {
		target.unbind('focus.' + this.propertyName);
		if (inst.options.showOnFocus) {
			target.bind('focus.' + this.propertyName, this._showPlugin);
		}
		if (inst.trigger) {
			inst.trigger.remove();
		}
		var trigger = inst.options.showTrigger;
		inst.trigger = (!trigger ? $([]) :
			$(trigger).clone().removeAttr('id').addClass(this._triggerClass)
				[inst.options.isRTL ? 'insertBefore' : 'insertAfter'](target).
				click(function() {
					if (!plugin._isDisabledPlugin(target[0])) {
						plugin[plugin.curInst == inst ? '_hidePlugin' : '_showPlugin'](target[0]);
					}
				}));
		this._autoSize(target, inst);
		var dates = this._extractDates(inst, target.val());
		if (dates) {
			this._setDatePlugin(target[0], dates, null, true);
		}
		var defaultDate = inst.get('defaultDate');
		if (inst.options.selectDefaultDate && defaultDate && inst.selectedDates.length == 0) {
			this._setDatePlugin(target[0], plugin.newDate(defaultDate || plugin.today()));
		}
	},

	/* Apply the maximum length for the date format.
	   @param  inst  (object) the current instance settings */
	_autoSize: function(target, inst) {
		if (inst.options.autoSize && !inst.inline) {
			var date = plugin.newDate(2009, 10, 20); // Ensure double digits
			var dateFormat = inst.options.dateFormat;
			if (dateFormat.match(/[DM]/)) {
				var findMax = function(names) {
					var max = 0;
					var maxI = 0;
					for (var i = 0; i < names.length; i++) {
						if (names[i].length > max) {
							max = names[i].length;
							maxI = i;
						}
					}
					return maxI;
				};
				date.setMonth(findMax(inst.options[dateFormat.match(/MM/) ? // Longest month
					'monthNames' : 'monthNamesShort']));
				date.setDate(findMax(inst.options[dateFormat.match(/DD/) ? // Longest day
					'dayNames' : 'dayNamesShort']) + 20 - date.getDay());
			}
			inst.target.attr('size', plugin.formatDate(dateFormat, date, inst.getConfig()).length);
		}
	},

	/* Remove the datepicker functionality from a control.
	   @param  target  (element) the control to affect */
	_destroyPlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = target.data(this.propertyName);
		if (inst.trigger) {
			inst.trigger.remove();
		}
		target.removeClass(this.markerClassName).removeData(this.propertyName).
			empty().unbind('.' + this.propertyName);
		if (inst.inline && $.fn.mousewheel) {
			target.unmousewheel();
		}
		if (!inst.inline && inst.options.autoSize) {
			target.removeAttr('size');
		}
	},

	/* Apply multiple event functions.
	   Usage, for example: onShow: multipleEvents(fn1, fn2, ...)
	   @param  fns  (function...) the functions to apply */
	multipleEvents: function(fns) {
		var funcs = arguments;
		return function(args) {
			for (var i = 0; i < funcs.length; i++) {
				funcs[i].apply(this, arguments);
			}
		};
	},

	/* Enable the control.
	   @param  target  (element) the control to affect */
	_enablePlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = target.data(this.propertyName);
		if (inst.inline) {
			target.children('.' + this._disableClass).remove().end().
				find('button,select').removeAttr('disabled').end().
				find('a').attr('href', 'javascript:void(0)');
		}
		else {
			target.prop('disabled', false);
			inst.trigger.filter('button.' + this._triggerClass).
				removeAttr('disabled').end().
				filter('img.' + this._triggerClass).
				css({opacity: '1.0', cursor: ''});
		}
		this._disabled = $.map(this._disabled,
			function(value) { return (value == target[0] ? null : value); }); // Delete entry
	},

	/* Disable the control.
	   @param  target  (element) the control to affect */
	_disablePlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = target.data(this.propertyName);
		if (inst.inline) {
			var inline = target.children(':last');
			var offset = inline.offset();
			var relOffset = {left: 0, top: 0};
			inline.parents().each(function() {
				if ($(this).css('position') == 'relative') {
					relOffset = $(this).offset();
					return false;
				}
			});
			var zIndex = target.css('zIndex');
			zIndex = (zIndex == 'auto' ? 0 : parseInt(zIndex, 10)) + 1;
			target.prepend('<div class="' + this._disableClass + '" style="' +
				'width: ' + inline.outerWidth() + 'px; height: ' + inline.outerHeight() +
				'px; left: ' + (offset.left - relOffset.left) + 'px; top: ' +
				(offset.top - relOffset.top) + 'px; z-index: ' + zIndex + '"></div>').
				find('button,select').attr('disabled', 'disabled').end().
				find('a').removeAttr('href');
		}
		else {
			target.prop('disabled', true);
			inst.trigger.filter('button.' + this._triggerClass).
				attr('disabled', 'disabled').end().
				filter('img.' + this._triggerClass).
				css({opacity: '0.5', cursor: 'default'});
		}
		this._disabled = $.map(this._disabled,
			function(value) { return (value == target[0] ? null : value); }); // Delete entry
		this._disabled.push(target[0]);
	},

	/* Is the first field in a jQuery collection disabled as a datepicker?
	   @param  target  (element) the control to examine
	   @return  (boolean) true if disabled, false if enabled */
	_isDisabledPlugin: function(target) {
		return (target && $.inArray(target, this._disabled) > -1);
	},

	/* Show a popup datepicker.
	   @param  target  (event) a focus event or
	                   (element) the control to use */
	_showPlugin: function(target) {
		target = $(target.target || target);
		var inst = target.data(plugin.propertyName);
		if (plugin.curInst == inst) {
			return;
		}
		if (plugin.curInst) {
			plugin._hidePlugin(plugin.curInst, true);
		}
		if (inst) {
			// Retrieve existing date(s)
			inst.lastVal = null;
			inst.selectedDates = plugin._extractDates(inst, target.val());
			inst.pickingRange = false;
			inst.drawDate = plugin._checkMinMax(plugin.newDate(inst.selectedDates[0] ||
				inst.get('defaultDate') || plugin.today()), inst);
			inst.prevDate = plugin.newDate(inst.drawDate);
			plugin.curInst = inst;
			// Generate content
			plugin._update(target[0], true);
			// Adjust position before showing
			var offset = plugin._checkOffset(inst);
			inst.div.css({left: offset.left, top: offset.top});
			// And display
			var showAnim = inst.options.showAnim;
			var showSpeed = inst.options.showSpeed;
			showSpeed = (showSpeed == 'normal' && $.ui && $.ui.version >= '1.8' ?
				'_default' : showSpeed);
			if ($.effects && $.effects[showAnim]) {
				var data = inst.div.data(); // Update old effects data
				for (var key in data) {
					if (key.match(/^ec\.storage\./)) {
						data[key] = inst._mainDiv.css(key.replace(/ec\.storage\./, ''));
					}
				}
				inst.div.data(data).show(showAnim, inst.options.showOptions, showSpeed);
			}
			else {
				inst.div[showAnim || 'show']((showAnim ? showSpeed : ''));
			}
		}
	},

	/* Extract possible dates from a string.
	   @param  inst  (object) the current instance settings
	   @param  text  (string) the text to extract from
	   @return  (CDate[]) the extracted dates */
	_extractDates: function(inst, datesText) {
		if (datesText == inst.lastVal) {
			return;
		}
		inst.lastVal = datesText;
		datesText = datesText.split(inst.options.multiSelect ? inst.options.multiSeparator :
			(inst.options.rangeSelect ? inst.options.rangeSeparator : '\x00'));
		var dates = [];
		for (var i = 0; i < datesText.length; i++) {
			try {
				var date = plugin.parseDate(inst.options.dateFormat, datesText[i], inst.getConfig());
				if (date) {
					var found = false;
					for (var j = 0; j < dates.length; j++) {
						if (dates[j].getTime() == date.getTime()) {
							found = true;
							break;
						}
					}
					if (!found) {
						dates.push(date);
					}
				}
			}
			catch (e) {
				// Ignore
			}
		}
		dates.splice(inst.options.multiSelect || (inst.options.rangeSelect ? 2 : 1), dates.length);
		if (inst.options.rangeSelect && dates.length == 1) {
			dates[1] = dates[0];
		}
		return dates;
	},

	/* Update the datepicker display.
	   @param  target  (event) a focus event or
	                   (element) the control to use
	   @param  hidden  (boolean) true to initially hide the datepicker */
	_update: function(target, hidden) {
		target = $(target.target || target);
		var inst = target.data(plugin.propertyName);
		if (inst) {
			if (inst.inline || plugin.curInst == inst) {
				if ($.isFunction(inst.options.onChangeMonthYear) && (!inst.prevDate ||
						inst.prevDate.getFullYear() != inst.drawDate.getFullYear() ||
						inst.prevDate.getMonth() != inst.drawDate.getMonth())) {
					inst.options.onChangeMonthYear.apply(target[0],
						[inst.drawDate.getFullYear(), inst.drawDate.getMonth() + 1]);
				}
			}
			if (inst.inline) {
				target.html(this._generateContent(target[0], inst));
			}
			else if (plugin.curInst == inst) {
				if (!inst.div) {
					inst.div = $('<div></div>').addClass(this._popupClass).
						css({display: (hidden ? 'none' : 'static'), position: 'absolute',
							left: target.offset().left,
							top: target.offset().top + target.outerHeight()}).
						appendTo($(inst.options.popupContainer || 'body'));
					if ($.fn.mousewheel) {
						inst.div.mousewheel(this._doMouseWheel);
					}
				}
				inst.div.html(this._generateContent(target[0], inst));
				target.focus();
			}
		}
	},

	/* Update the input field and any alternate field with the current dates.
	   @param  target  (element) the control to use
	   @param  keyUp   (boolean, internal) true if coming from keyUp processing */
	_updateInput: function(target, keyUp) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			var value = '';
			var altValue = '';
			var sep = (inst.options.multiSelect ? inst.options.multiSeparator :
				inst.options.rangeSeparator);
			var altFormat = inst.options.altFormat || inst.options.dateFormat;
			for (var i = 0; i < inst.selectedDates.length; i++) {
				value += (keyUp ? '' : (i > 0 ? sep : '') + plugin.formatDate(
					inst.options.dateFormat, inst.selectedDates[i], inst.getConfig()));
				altValue += (i > 0 ? sep : '') + plugin.formatDate(
					altFormat, inst.selectedDates[i], inst.getConfig());
			}
			if (!inst.inline && !keyUp) {
				$(target).val(value);
			}
			$(inst.options.altField).val(altValue);
			if ($.isFunction(inst.options.onSelect) && !keyUp && !inst.inSelect) {
				inst.inSelect = true; // Prevent endless loops
				inst.options.onSelect.apply(target, [inst.selectedDates]);
				inst.inSelect = false;
			}
		}
	},

	/* Retrieve the size of left and top borders for an element.
	   @param  elem  (jQuery) the element of interest
	   @return  (number[2]) the left and top borders */
	_getBorders: function(elem) {
		var convert = function(value) {
			return {thin: 1, medium: 3, thick: 5}[value] || value;
		};
		return [parseFloat(convert(elem.css('border-left-width'))),
			parseFloat(convert(elem.css('border-top-width')))];
	},

	/* Check positioning to remain on the screen.
	   @param  inst  (object) the current instance settings
	   @return  (object) the updated offset for the datepicker */
	_checkOffset: function(inst) {
		var base = (inst.target.is(':hidden') && inst.trigger ? inst.trigger : inst.target);
		var offset = base.offset();
		var browserWidth = $(window).width();
		var browserHeight = $(window).height();
		if (browserWidth == 0) {
			return offset;
		}
		var isFixed = false;
		$(inst.target).parents().each(function() {
			isFixed |= $(this).css('position') == 'fixed';
			return !isFixed;
		});
		var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		var above = offset.top - (isFixed ? scrollY : 0) - inst.div.outerHeight();
		var below = offset.top - (isFixed ? scrollY : 0) + base.outerHeight();
		var alignL = offset.left - (isFixed ? scrollX : 0);
		var alignR = offset.left - (isFixed ? scrollX : 0) + base.outerWidth() - inst.div.outerWidth();
		var tooWide = (offset.left - scrollX + inst.div.outerWidth()) > browserWidth;
		var tooHigh = (offset.top - scrollY + inst.target.outerHeight() +
			inst.div.outerHeight()) > browserHeight;
		inst.div.css('position', isFixed ? 'fixed' : 'absolute');
		var alignment = inst.options.alignment;
		if (alignment == 'topLeft') {
			offset = {left: alignL, top: above};
		}
		else if (alignment == 'topRight') {
			offset = {left: alignR, top: above};
		}
		else if (alignment == 'bottomLeft') {
			offset = {left: alignL, top: below};
		}
		else if (alignment == 'bottomRight') {
			offset = {left: alignR, top: below};
		}
		else if (alignment == 'top') {
			offset = {left: (inst.options.isRTL || tooWide ? alignR : alignL), top: above};
		}
		else { // bottom
			offset = {left: (inst.options.isRTL || tooWide ? alignR : alignL),
				top: (tooHigh ? above : below)};
		}
		offset.left = Math.max((isFixed ? 0 : scrollX), offset.left);
		offset.top = Math.max((isFixed ? 0 : scrollY), offset.top);
		return offset;
	},

	/* Close date picker if clicked elsewhere.
	   @param  event  (MouseEvent) the mouse click to check */
	_checkExternalClick: function(event) {
		if (!plugin.curInst) {
			return;
		}
		var target = $(event.target);
		if (!target.parents().andSelf().hasClass(plugin._popupClass) &&
				!target.hasClass(plugin.markerClassName) &&
				!target.parents().andSelf().hasClass(plugin._triggerClass)) {
			plugin._hidePlugin(plugin.curInst);
		}
	},

	/* Hide a popup datepicker.
	   @param  target     (element) the control to use or
	                      (object) the current instance settings
	   @param  immediate  (boolean) true to close immediately without animation */
	_hidePlugin: function(target, immediate) {
		if (!target) {
			return;
		}
		var inst = $.data(target, this.propertyName) || target;
		if (inst && inst == plugin.curInst) {
			var showAnim = (immediate ? '' : inst.options.showAnim);
			var showSpeed = inst.options.showSpeed;
			showSpeed = (showSpeed == 'normal' && $.ui && $.ui.version >= '1.8' ?
				'_default' : showSpeed);
			var postProcess = function() {
				if (!inst.div) {
					return;
				}
				inst.div.remove();
				inst.div = null;
				plugin.curInst = null;
				if ($.isFunction(inst.options.onClose)) {
					inst.options.onClose.apply(target, [inst.selectedDates]);
				}
			};
			inst.div.stop();
			if ($.effects && $.effects[showAnim]) {
				inst.div.hide(showAnim, inst.options.showOptions, showSpeed, postProcess);
			}
			else {
				var hideAnim = (showAnim == 'slideDown' ? 'slideUp' :
					(showAnim == 'fadeIn' ? 'fadeOut' : 'hide'));
				inst.div[hideAnim]((showAnim ? showSpeed : ''), postProcess);
			}
			if (!showAnim) {
				postProcess();
			}
		}
	},

	/* Handle keystrokes in the datepicker.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if not handled, false if handled */
	_keyDown: function(event) {
		var target = event.target;
		var inst = $.data(target, plugin.propertyName);
		var handled = false;
		if (inst.div) {
			if (event.keyCode == 9) { // Tab - close
				plugin._hidePlugin(target);
			}
			else if (event.keyCode == 13) { // Enter - select
				plugin._selectDatePlugin(target,
					$('a.' + inst.options.renderer.highlightedClass, inst.div)[0]);
				handled = true;
			}
			else { // Command keystrokes
				var commands = inst.options.commands;
				for (var name in commands) {
					var command = commands[name];
					if (command.keystroke.keyCode == event.keyCode &&
							!!command.keystroke.ctrlKey == !!(event.ctrlKey || event.metaKey) &&
							!!command.keystroke.altKey == event.altKey &&
							!!command.keystroke.shiftKey == event.shiftKey) {
						plugin._performActionPlugin(target, name);
						handled = true;
						break;
					}
				}
			}
		}
		else { // Show on 'current' keystroke
			var command = inst.options.commands.current;
			if (command.keystroke.keyCode == event.keyCode &&
					!!command.keystroke.ctrlKey == !!(event.ctrlKey || event.metaKey) &&
					!!command.keystroke.altKey == event.altKey &&
					!!command.keystroke.shiftKey == event.shiftKey) {
				plugin._showPlugin(target);
				handled = true;
			}
		}
		inst.ctrlKey = ((event.keyCode < 48 && event.keyCode != 32) ||
			event.ctrlKey || event.metaKey);
		if (handled) {
			event.preventDefault();
			event.stopPropagation();
		}
		return !handled;
	},

	/* Filter keystrokes in the datepicker.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if allowed, false if not allowed */
	_keyPress: function(event) {
		var inst = $.data(event.target, plugin.propertyName);
		if (inst && inst.options.constrainInput) {
			var ch = String.fromCharCode(event.keyCode || event.charCode);
			var allowedChars = plugin._allowedChars(inst);
			return (event.metaKey || inst.ctrlKey || ch < ' ' ||
				!allowedChars || allowedChars.indexOf(ch) > -1);
		}
		return true;
	},

	/* Determine the set of characters allowed by the date format.
	   @param  inst  (object) the current instance settings
	   @return  (string) the set of allowed characters, or null if anything allowed */
	_allowedChars: function(inst) {
		var allowedChars = (inst.options.multiSelect ? inst.options.multiSeparator :
			(inst.options.rangeSelect ? inst.options.rangeSeparator : ''));
		var literal = false;
		var hasNum = false;
		var dateFormat = inst.options.dateFormat;
		for (var i = 0; i < dateFormat.length; i++) {
			var ch = dateFormat.charAt(i);
			if (literal) {
				if (ch == "'" && dateFormat.charAt(i + 1) != "'") {
					literal = false;
				}
				else {
					allowedChars += ch;
				}
			}
			else {
				switch (ch) {
					case 'd': case 'm': case 'o': case 'w':
						allowedChars += (hasNum ? '' : '0123456789'); hasNum = true; break;
					case 'y': case '@': case '!':
						allowedChars += (hasNum ? '' : '0123456789') + '-'; hasNum = true; break;
					case 'J':
						allowedChars += (hasNum ? '' : '0123456789') + '-.'; hasNum = true; break;
					case 'D': case 'M': case 'Y':
						return null; // Accept anything
					case "'":
						if (dateFormat.charAt(i + 1) == "'") {
							allowedChars += "'";
						}
						else {
							literal = true;
						}
						break;
					default:
						allowedChars += ch;
				}
			}
		}
		return allowedChars;
	},

	/* Synchronise datepicker with the field.
	   @param  event  (KeyEvent) the keystroke
	   @return  (boolean) true if allowed, false if not allowed */
	_keyUp: function(event) {
		var target = event.target;
		var inst = $.data(target, plugin.propertyName);
		if (inst && !inst.ctrlKey && inst.lastVal != inst.target.val()) {
			try {
				var dates = plugin._extractDates(inst, inst.target.val());
				if (dates.length > 0) {
					plugin._setDatePlugin(target, dates, null, true);
				}
			}
			catch (event) {
				// Ignore
			}
		}
		return true;
	},

	/* Increment/decrement month/year on mouse wheel activity.
	   @param  event  (event) the mouse wheel event
	   @param  delta  (number) the amount of change */
	_doMouseWheel: function(event, delta) {
		var target = (plugin.curInst && plugin.curInst.target[0]) ||
			$(event.target).closest('.' + plugin.markerClassName)[0];
		if (plugin._isDisabledPlugin(target)) {
			return;
		}
		var inst = $.data(target, plugin.propertyName);
		if (inst.options.useMouseWheel) {
			delta = (delta < 0 ? -1 : +1);
			plugin._changeMonthPlugin(target,
				-inst.options[event.ctrlKey ? 'monthsToJump' : 'monthsToStep'] * delta);
		}
		event.preventDefault();
	},

	/* Clear an input and close a popup datepicker.
	   @param  target  (element) the control to use */
	_clearPlugin: function(target) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			inst.selectedDates = [];
			this._hidePlugin(target);
			var defaultDate = inst.get('defaultDate');
			if (inst.options.selectDefaultDate && defaultDate) {
				this._setDatePlugin(target, plugin.newDate(defaultDate || plugin.today()));
			}
			else {
				this._updateInput(target);
			}
		}
	},

	/* Retrieve the selected date(s) for a datepicker.
	   @param  target  (element) the control to examine
	   @return  (CDate[]) the selected date(s) */
	_getDatePlugin: function(target) {
		var inst = $.data(target, this.propertyName);
		return (inst ? inst.selectedDates : []);
	},

	/* Set the selected date(s) for a datepicker.
	   @param  target   (element) the control to examine
	   @param  dates    (CDate or number or string or [] of these) the selected date(s)
	   @param  endDate  (CDate or number or string) the ending date for a range (optional)
	   @param  keyUp    (boolean, internal) true if coming from keyUp processing
	   @param  setOpt   (boolean, internal) true if coming from option processing */
	_setDatePlugin: function(target, dates, endDate, keyUp, setOpt) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			if (!$.isArray(dates)) {
				dates = [dates];
				if (endDate) {
					dates.push(endDate);
				}
			}
			var minDate = inst.get('minDate');
			var maxDate = inst.get('maxDate');
			var curDate = inst.selectedDates[0];
			inst.selectedDates = [];
			for (var i = 0; i < dates.length; i++) {
				var date = plugin.determineDate(
					dates[i], null, curDate, inst.options.dateFormat, inst.getConfig());
				if (date) {
					if ((!minDate || date.getTime() >= minDate.getTime()) &&
							(!maxDate || date.getTime() <= maxDate.getTime())) {
						var found = false;
						for (var j = 0; j < inst.selectedDates.length; j++) {
							if (inst.selectedDates[j].getTime() == date.getTime()) {
								found = true;
								break;
							}
						}
						if (!found) {
							inst.selectedDates.push(date);
						}
					}
				}
			}
			inst.selectedDates.splice(inst.options.multiSelect ||
				(inst.options.rangeSelect ? 2 : 1), inst.selectedDates.length);
			if (inst.options.rangeSelect) {
				switch (inst.selectedDates.length) {
					case 1: inst.selectedDates[1] = inst.selectedDates[0]; break;
					case 2: inst.selectedDates[1] =
						(inst.selectedDates[0].getTime() > inst.selectedDates[1].getTime() ?
						inst.selectedDates[0] : inst.selectedDates[1]); break;
				}
				inst.pickingRange = false;
			}
			inst.prevDate = (inst.drawDate ? plugin.newDate(inst.drawDate) : null);
			inst.drawDate = this._checkMinMax(plugin.newDate(inst.selectedDates[0] ||
				inst.get('defaultDate') || plugin.today()), inst);
			if (!setOpt) {
				this._update(target);
				this._updateInput(target, keyUp);
			}
		}
	},

	/* Determine whether a date is selectable for this datepicker.
	   @param  target  (element) the control to check
	   @param  date    (Date or string or number) the date to check
	   @return  (boolean) true if selectable, false if not */
	_isSelectablePlugin: function(target, date) {
		var inst = $.data(target, this.propertyName);
		if (!inst) {
			return false;
		}
		date = plugin.determineDate(date, inst.selectedDates[0] || this.today(), null,
			inst.options.dateFormat, inst.getConfig());
		return this._isSelectable(target, date, inst.options.onDate,
			inst.get('minDate'), inst.get('maxDate'));
	},

	/* Internally determine whether a date is selectable for this datepicker.
	   @param  target   (element) the control to check
	   @param  date     (Date) the date to check
	   @param  onDate   (function or boolean) any onDate callback or callback.selectable
	   @param  mindate  (Date) the minimum allowed date
	   @param  maxdate  (Date) the maximum allowed date
	   @return  (boolean) true if selectable, false if not */
	_isSelectable: function(target, date, onDate, minDate, maxDate) {
		var dateInfo = (typeof onDate == 'boolean' ? {selectable: onDate} :
			(!$.isFunction(onDate) ? {} : onDate.apply(target, [date, true])));
		return (dateInfo.selectable != false) &&
			(!minDate || date.getTime() >= minDate.getTime()) &&
			(!maxDate || date.getTime() <= maxDate.getTime());
	},

	/* Perform a named action for a datepicker.
	   @param  target  (element) the control to affect
	   @param  action  (string) the name of the action */
	_performActionPlugin: function(target, action) {
		var inst = $.data(target, this.propertyName);
		if (inst && !this._isDisabledPlugin(target)) {
			var commands = inst.options.commands;
			if (commands[action] && commands[action].enabled.apply(target, [inst])) {
				commands[action].action.apply(target, [inst]);
			}
		}
	},

	/* Set the currently shown month, defaulting to today's.
	   @param  target  (element) the control to affect
	   @param  year    (number) the year to show (optional)
	   @param  month   (number) the month to show (1-12) (optional)
	   @param  day     (number) the day to show (optional) */
	_showMonthPlugin: function(target, year, month, day) {
		var inst = $.data(target, this.propertyName);
		if (inst && (day != null ||
				(inst.drawDate.getFullYear() != year || inst.drawDate.getMonth() + 1 != month))) {
			inst.prevDate = plugin.newDate(inst.drawDate);
			var show = this._checkMinMax((year != null ?
				plugin.newDate(year, month, 1) : plugin.today()), inst);
			inst.drawDate = plugin.newDate(show.getFullYear(), show.getMonth() + 1, 
				(day != null ? day : Math.min(inst.drawDate.getDate(),
				plugin.daysInMonth(show.getFullYear(), show.getMonth() + 1))));
			this._update(target);
		}
	},

	/* Adjust the currently shown month.
	   @param  target  (element) the control to affect
	   @param  offset  (number) the number of months to change by */
	_changeMonthPlugin: function(target, offset) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			var date = plugin.add(plugin.newDate(inst.drawDate), offset, 'm');
			this._showMonthPlugin(target, date.getFullYear(), date.getMonth() + 1);
		}
	},

	/* Adjust the currently shown day.
	   @param  target  (element) the control to affect
	   @param  offset  (number) the number of days to change by */
	_changeDayPlugin: function(target, offset) {
		var inst = $.data(target, this.propertyName);
		if (inst) {
			var date = plugin.add(plugin.newDate(inst.drawDate), offset, 'd');
			this._showMonthPlugin(target, date.getFullYear(), date.getMonth() + 1, date.getDate());
		}
	},

	/* Restrict a date to the minimum/maximum specified.
	   @param  date  (CDate) the date to check
	   @param  inst  (object) the current instance settings */
	_checkMinMax: function(date, inst) {
		var minDate = inst.get('minDate');
		var maxDate = inst.get('maxDate');
		date = (minDate && date.getTime() < minDate.getTime() ? plugin.newDate(minDate) : date);
		date = (maxDate && date.getTime() > maxDate.getTime() ? plugin.newDate(maxDate) : date);
		return date;
	},

	/* Retrieve the date associated with an entry in the datepicker.
	   @param  target  (element) the control to examine
	   @param  elem    (element) the selected datepicker element
	   @return  (CDate) the corresponding date, or null */
	_retrieveDatePlugin: function(target, elem) {
		var inst = $.data(target, this.propertyName);
		return (!inst ? null : this._normaliseDate(
			new Date(parseInt(elem.className.replace(/^.*dp(-?\d+).*$/, '$1'), 10))));
	},

	/* Select a date for this datepicker.
	   @param  target  (element) the control to examine
	   @param  elem    (element) the selected datepicker element */
	_selectDatePlugin: function(target, elem) {
		var inst = $.data(target, this.propertyName);
		if (inst && !this._isDisabledPlugin(target)) {
			var date = this._retrieveDatePlugin(target, elem);
			if (inst.options.multiSelect) {
				var found = false;
				for (var i = 0; i < inst.selectedDates.length; i++) {
					if (date.getTime() == inst.selectedDates[i].getTime()) {
						inst.selectedDates.splice(i, 1);
						found = true;
						break;
					}
				}
				if (!found && inst.selectedDates.length < inst.options.multiSelect) {
					inst.selectedDates.push(date);
				}
			}
			else if (inst.options.rangeSelect) {
				if (inst.pickingRange) {
					inst.selectedDates[1] = date;
				}
				else {
					inst.selectedDates = [date, date];
				}
				inst.pickingRange = !inst.pickingRange;
			}
			else {
				inst.selectedDates = [date];
			}
			inst.prevDate = plugin.newDate(date);
			this._updateInput(target);
			if (inst.inline || inst.pickingRange || inst.selectedDates.length <
					(inst.options.multiSelect || (inst.options.rangeSelect ? 2 : 1))) {
				this._update(target);
			}
			else {
				this._hidePlugin(target);
			}
		}
	},

	/* Generate the datepicker content for this control.
	   @param  target  (element) the control to affect
	   @param  inst    (object) the current instance settings
	   @return  (jQuery) the datepicker content */
	_generateContent: function(target, inst) {
		var monthsToShow = inst.options.monthsToShow;
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		inst.drawDate = this._checkMinMax(
			inst.drawDate || inst.get('defaultDate') || plugin.today(), inst);
		var drawDate = plugin._applyMonthsOffset(plugin.newDate(inst.drawDate), inst);
		// Generate months
		var monthRows = '';
		for (var row = 0; row < monthsToShow[0]; row++) {
			var months = '';
			for (var col = 0; col < monthsToShow[1]; col++) {
				months += this._generateMonth(target, inst, drawDate.getFullYear(),
					drawDate.getMonth() + 1, inst.options.renderer, (row == 0 && col == 0));
				plugin.add(drawDate, 1, 'm');
			}
			monthRows += this._prepare(inst.options.renderer.monthRow, inst).replace(/\{months\}/, months);
		}
		var picker = this._prepare(inst.options.renderer.picker, inst).replace(/\{months\}/, monthRows).
			replace(/\{weekHeader\}/g, this._generateDayHeaders(inst, inst.options.renderer));
		// Add commands
		var addCommand = function(type, open, close, name, classes) {
			if (picker.indexOf('{' + type + ':' + name + '}') == -1) {
				return;
			}
			var command = inst.options.commands[name];
			var date = (inst.options.commandsAsDateFormat ? command.date.apply(target, [inst]) : null);
			picker = picker.replace(new RegExp('\\{' + type + ':' + name + '\\}', 'g'),
				'<' + open +
				(command.status ? ' title="' + inst.options[command.status] + '"' : '') +
				' class="' + inst.options.renderer.commandClass + ' ' +
				inst.options.renderer.commandClass + '-' + name + ' ' + classes +
				(command.enabled(inst) ? '' : ' ' + inst.options.renderer.disabledClass) + '">' +
				(date ? plugin.formatDate(inst.options[command.text], date, inst.getConfig()) :
				inst.options[command.text]) + '</' + close + '>');
		};
		for (var name in inst.options.commands) {
			addCommand('button', 'button type="button"', 'button', name,
				inst.options.renderer.commandButtonClass);
			addCommand('link', 'a href="javascript:void(0)"', 'a', name,
				inst.options.renderer.commandLinkClass);
		}
		picker = $(picker);
		if (monthsToShow[1] > 1) {
			var count = 0;
			$(inst.options.renderer.monthSelector, picker).each(function() {
				var nth = ++count % monthsToShow[1];
				$(this).addClass(nth == 1 ? 'first' : (nth == 0 ? 'last' : ''));
			});
		}
		// Add datepicker behaviour
		var self = this;
		picker.find(inst.options.renderer.daySelector + ' a').hover(
				function() { $(this).addClass(inst.options.renderer.highlightedClass); },
				function() {
					(inst.inline ? $(this).parents('.' + self.markerClassName) : inst.div).
						find(inst.options.renderer.daySelector + ' a').
						removeClass(inst.options.renderer.highlightedClass);
				}).
			click(function() {
				self._selectDatePlugin(target, this);
			}).end().
			find('select.' + this._monthYearClass + ':not(.' + this._anyYearClass + ')').
			change(function() {
				var monthYear = $(this).val().split('/');
				self._showMonthPlugin(target, parseInt(monthYear[1], 10), parseInt(monthYear[0], 10));
			}).end().
			find('select.' + this._anyYearClass).click(function() {
				$(this).css('visibility', 'hidden').
					next('input').css({left: this.offsetLeft, top: this.offsetTop,
					width: this.offsetWidth, height: this.offsetHeight}).show().focus();
			}).end().
			find('input.' + self._monthYearClass).change(function() {
				try {
					var year = parseInt($(this).val(), 10);
					year = (isNaN(year) ? inst.drawDate.getFullYear() : year);
					self._showMonthPlugin(target, year, inst.drawDate.getMonth() + 1, inst.drawDate.getDate());
				}
				catch (e) {
					alert(e);
				}
			}).keydown(function(event) {
				if (event.keyCode == 13) { // Enter
					$(event.target).change();
				}
				else if (event.keyCode == 27) { // Escape
					$(event.target).hide().prev('select').css('visibility', 'visible');
					inst.target.focus();
				}
			});
		// Add command behaviour
		picker.find('.' + inst.options.renderer.commandClass).click(function() {
				if (!$(this).hasClass(inst.options.renderer.disabledClass)) {
					var action = this.className.replace(
						new RegExp('^.*' + inst.options.renderer.commandClass + '-([^ ]+).*$'), '$1');
					plugin._performActionPlugin(target, action);
				}
			});
		// Add classes
		if (inst.options.isRTL) {
			picker.addClass(inst.options.renderer.rtlClass);
		}
		if (monthsToShow[0] * monthsToShow[1] > 1) {
			picker.addClass(inst.options.renderer.multiClass);
		}
		if (inst.options.pickerClass) {
			picker.addClass(inst.options.pickerClass);
		}
		// Resize
		$('body').append(picker);
		var width = 0;
		picker.find(inst.options.renderer.monthSelector).each(function() {
			width += $(this).outerWidth();
		});
		picker.width(width / monthsToShow[0]);
		// Pre-show customisation
		if ($.isFunction(inst.options.onShow)) {
			inst.options.onShow.apply(target, [picker, inst]);
		}
		return picker;
	},

	/* Generate the content for a single month.
	   @param  target    (element) the control to affect
	   @param  inst      (object) the current instance settings
	   @param  year      (number) the year to generate
	   @param  month     (number) the month to generate
	   @param  renderer  (object) the rendering templates
	   @param  first     (boolean) true if first of multiple months
	   @return  (string) the month content */
	_generateMonth: function(target, inst, year, month, renderer, first) {
		var daysInMonth = plugin.daysInMonth(year, month);
		var monthsToShow = inst.options.monthsToShow;
		monthsToShow = ($.isArray(monthsToShow) ? monthsToShow : [1, monthsToShow]);
		var fixedWeeks = inst.options.fixedWeeks || (monthsToShow[0] * monthsToShow[1] > 1);
		var firstDay = inst.options.firstDay;
		var leadDays = (plugin.newDate(year, month, 1).getDay() - firstDay + 7) % 7;
		var numWeeks = (fixedWeeks ? 6 : Math.ceil((leadDays + daysInMonth) / 7));
		var selectOtherMonths = inst.options.selectOtherMonths && inst.options.showOtherMonths;
		var minDate = (inst.pickingRange ? inst.selectedDates[0] : inst.get('minDate'));
		var maxDate = inst.get('maxDate');
		var showWeeks = renderer.week.indexOf('{weekOfYear}') > -1;
		var today = plugin.today();
		var drawDate = plugin.newDate(year, month, 1);
		plugin.add(drawDate, -leadDays - (fixedWeeks && (drawDate.getDay() == firstDay) ? 7 : 0), 'd');
		var ts = drawDate.getTime();
		// Generate weeks
		var weeks = '';
		for (var week = 0; week < numWeeks; week++) {
			var weekOfYear = (!showWeeks ? '' : '<span class="dp' + ts + '">' +
				($.isFunction(inst.options.calculateWeek) ? inst.options.calculateWeek(drawDate) : 0) + '</span>');
			var days = '';
			for (var day = 0; day < 7; day++) {
				var selected = false;
				if (inst.options.rangeSelect && inst.selectedDates.length > 0) {
					selected = (drawDate.getTime() >= inst.selectedDates[0] &&
						drawDate.getTime() <= inst.selectedDates[1]);
				}
				else {
					for (var i = 0; i < inst.selectedDates.length; i++) {
						if (inst.selectedDates[i].getTime() == drawDate.getTime()) {
							selected = true;
							break;
						}
					}
				}
				var dateInfo = (!$.isFunction(inst.options.onDate) ? {} :
					inst.options.onDate.apply(target, [drawDate, drawDate.getMonth() + 1 == month]));
				var selectable = (selectOtherMonths || drawDate.getMonth() + 1 == month) &&
					this._isSelectable(target, drawDate, dateInfo.selectable, minDate, maxDate);
				days += this._prepare(renderer.day, inst).replace(/\{day\}/g,
					(selectable ? '<a href="javascript:void(0)"' : '<span') +
					' class="dp' + ts + ' ' + (dateInfo.dateClass || '') +
					(selected && (selectOtherMonths || drawDate.getMonth() + 1 == month) ?
					' ' + renderer.selectedClass : '') +
					(selectable ? ' ' + renderer.defaultClass : '') +
					((drawDate.getDay() || 7) < 6 ? '' : ' ' + renderer.weekendClass) +
					(drawDate.getMonth() + 1 == month ? '' : ' ' + renderer.otherMonthClass) +
					(drawDate.getTime() == today.getTime() && (drawDate.getMonth() + 1) == month ?
					' ' + renderer.todayClass : '') +
					(drawDate.getTime() == inst.drawDate.getTime() && (drawDate.getMonth() + 1) == month ?
					' ' + renderer.highlightedClass : '') + '"' +
					(dateInfo.title || (inst.options.dayStatus && selectable) ? ' title="' +
					(dateInfo.title || plugin.formatDate(
					inst.options.dayStatus, drawDate, inst.getConfig())) + '"' : '') + '>' +
					(inst.options.showOtherMonths || (drawDate.getMonth() + 1) == month ?
					dateInfo.content || drawDate.getDate() : '&nbsp;') +
					(selectable ? '</a>' : '</span>'));
				plugin.add(drawDate, 1, 'd');
				ts = drawDate.getTime();
			}
			weeks += this._prepare(renderer.week, inst).replace(/\{days\}/g, days).
				replace(/\{weekOfYear\}/g, weekOfYear);
		}
		var monthHeader = this._prepare(renderer.month, inst).match(/\{monthHeader(:[^\}]+)?\}/);
		monthHeader = (monthHeader[0].length <= 13 ? 'MM yyyy' :
			monthHeader[0].substring(13, monthHeader[0].length - 1));
		monthHeader = (first ? this._generateMonthSelection(
			inst, year, month, minDate, maxDate, monthHeader, renderer) :
			plugin.formatDate(monthHeader, plugin.newDate(year, month, 1), inst.getConfig()));
		var weekHeader = this._prepare(renderer.weekHeader, inst).
			replace(/\{days\}/g, this._generateDayHeaders(inst, renderer));
		return this._prepare(renderer.month, inst).replace(/\{monthHeader(:[^\}]+)?\}/g, monthHeader).
			replace(/\{weekHeader\}/g, weekHeader).replace(/\{weeks\}/g, weeks);
	},

	/* Generate the HTML for the day headers.
	   @param  inst      (object) the current instance settings
	   @param  renderer  (object) the rendering templates
	   @return  (string) a week's worth of day headers */
	_generateDayHeaders: function(inst, renderer) {
		var header = '';
		for (var day = 0; day < 7; day++) {
			var dow = (day + inst.options.firstDay) % 7;
			header += this._prepare(renderer.dayHeader, inst).replace(/\{day\}/g,
				'<span class="' + this._curDoWClass + dow + '" title="' +
				inst.options.dayNames[dow] + '">' + inst.options.dayNamesMin[dow] + '</span>');
		}
		return header;
	},

	/* Generate selection controls for month.
	   @param  inst         (object) the current instance settings
	   @param  year         (number) the year to generate
	   @param  month        (number) the month to generate
	   @param  minDate      (CDate) the minimum date allowed
	   @param  maxDate      (CDate) the maximum date allowed
	   @param  monthHeader  (string) the month/year format
	   @return  (string) the month selection content */
	_generateMonthSelection: function(inst, year, month, minDate, maxDate, monthHeader) {
		if (!inst.options.changeMonth) {
			return plugin.formatDate(
				monthHeader, plugin.newDate(year, month, 1), inst.getConfig());
		}
		// Months
		var monthNames = inst.options['monthNames' + (monthHeader.match(/mm/i) ? '' : 'Short')];
		var html = monthHeader.replace(/m+/i, '\\x2E').replace(/y+/i, '\\x2F');
		var selector = '<select class="' + this._monthYearClass +
			'" title="' + inst.options.monthStatus + '">';
		for (var m = 1; m <= 12; m++) {
			if ((!minDate || plugin.newDate(year, m, plugin.daysInMonth(year, m)).
					getTime() >= minDate.getTime()) &&
					(!maxDate || plugin.newDate(year, m, 1).getTime() <= maxDate.getTime())) {
				selector += '<option value="' + m + '/' + year + '"' +
					(month == m ? ' selected="selected"' : '') + '>' +
					monthNames[m - 1] + '</option>';
			}
		}
		selector += '</select>';
		html = html.replace(/\\x2E/, selector);
		// Years
		var yearRange = inst.options.yearRange;
		if (yearRange == 'any') {
			selector = '<select class="' + this._monthYearClass + ' ' + this._anyYearClass +
				'" title="' + inst.options.yearStatus + '">' +
				'<option>' + year + '</option></select>' +
				'<input class="' + this._monthYearClass + ' ' + this._curMonthClass +
				month + '" value="' + year + '">';
		}
		else {
			yearRange = yearRange.split(':');
			var todayYear = plugin.today().getFullYear();
			var start = (yearRange[0].match('c[+-].*') ? year + parseInt(yearRange[0].substring(1), 10) :
				((yearRange[0].match('[+-].*') ? todayYear : 0) + parseInt(yearRange[0], 10)));
			var end = (yearRange[1].match('c[+-].*') ? year + parseInt(yearRange[1].substring(1), 10) :
				((yearRange[1].match('[+-].*') ? todayYear : 0) + parseInt(yearRange[1], 10)));
			selector = '<select class="' + this._monthYearClass +
				'" title="' + inst.options.yearStatus + '">';
			start = plugin.add(plugin.newDate(start + 1, 1, 1), -1, 'd');
			end = plugin.newDate(end, 1, 1);
			var addYear = function(y) {
				if (y != 0) {
					selector += '<option value="' + month + '/' + y + '"' +
						(year == y ? ' selected="selected"' : '') + '>' + y + '</option>';
				}
			};
			if (start.getTime() < end.getTime()) {
				start = (minDate && minDate.getTime() > start.getTime() ? minDate : start).getFullYear();
				end = (maxDate && maxDate.getTime() < end.getTime() ? maxDate : end).getFullYear();
				for (var y = start; y <= end; y++) {
					addYear(y);
				}
			}
			else {
				start = (maxDate && maxDate.getTime() < start.getTime() ? maxDate : start).getFullYear();
				end = (minDate && minDate.getTime() > end.getTime() ? minDate : end).getFullYear();
				for (var y = start; y >= end; y--) {
					addYear(y);
				}
			}
			selector += '</select>';
		}
		html = html.replace(/\\x2F/, selector);
		return html;
	},

	/* Prepare a render template for use.
	   Exclude popup/inline sections that are not applicable.
	   Localise text of the form: {l10n:name}.
	   @param  text  (string) the text to localise
	   @param  inst  (object) the current instance settings
	   @return  (string) the localised text */
	_prepare: function(text, inst) {
		var replaceSection = function(type, retain) {
			while (true) {
				var start = text.indexOf('{' + type + ':start}');
				if (start == -1) {
					return;
				}
				var end = text.substring(start).indexOf('{' + type + ':end}');
				if (end > -1) {
					text = text.substring(0, start) +
						(retain ? text.substr(start + type.length + 8, end - type.length - 8) : '') +
						text.substring(start + end + type.length + 6);
				}
			}
		};
		replaceSection('inline', inst.inline);
		replaceSection('popup', !inst.inline);
		var pattern = /\{l10n:([^\}]+)\}/;
		var matches = null;
		while (matches = pattern.exec(text)) {
			text = text.replace(matches[0], inst.options[matches[1]]);
		}
		return text;
	}
});

// The list of commands that return values and don't permit chaining
var getters = ['getDate', 'isDisabled', 'isSelectable', 'retrieveDate'];

/* Determine whether a command is a getter and doesn't permit chaining.
   @param  command    (string, optional) the command to run
   @param  otherArgs  ([], optional) any other arguments for the command
   @return  true if the command is a getter, false if not */
function isNotChained(command, otherArgs) {
	if (command == 'option' && (otherArgs.length == 0 ||
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string'))) {
		return true;
	}
	return $.inArray(command, getters) > -1;
}

/* Attach the datepicker functionality to a jQuery selection.
   @param  options  (object) the new settings to use for these instances (optional) or
                    (string) the command to run (optional)
   @return  (jQuery) for chaining further calls or
            (any) getter value */
$.fn.datepick = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (isNotChained(options, otherArgs)) {
		return plugin['_' + options + 'Plugin'].apply(plugin, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!plugin['_' + options + 'Plugin']) {
				throw 'Unknown command: ' + options;
			}
			plugin['_' + options + 'Plugin'].apply(plugin, [this].concat(otherArgs));
		}
		else {
			plugin._attachPlugin(this, options || {});
		}
	});
};

/* Initialise the datepicker functionality. */
var plugin = $.datepick = new Datepicker(); // Singleton instance

$(function() {
	$(document).mousedown(plugin._checkExternalClick).
		resize(function() { plugin._hidePlugin(plugin.curInst); });
});

})(jQuery);

 }

    /*--------------------------------------------------------------------------*/

    // Verify if define is present as a function.
    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        define(['angular', 'jQuery', 'lodash', 'moment'], function(angular, jQuery, lodash, moment) {
            return createModule(angular, jQuery, lodash, moment);
        });
    }
    else if ( typeof angular !== "undefined" && angular !== null ) {
        createModule(angular, $, _, moment);
    }
}.call(this));
