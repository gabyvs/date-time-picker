import angular from 'angular';
import jQuery from 'jquery';
import _ from 'lodash';
import moment from 'moment';

import datepick from 'imports?jQuery=jquery!./datepick/jquery.datepick.js'

import template from './date-time-picker.html';

function bootstrap() {
    /*!
     * Bootstrap v3.3.5 (http://getbootstrap.com)
     * Copyright 2011-2015 Twitter, Inc.
     * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
     */

    /*!
     * Generated using the Bootstrap Customizer (http://getbootstrap.com/customize/?id=fb2f2b498dc3ed0d6db1)
     * Config saved to config.json and https://gist.github.com/fb2f2b498dc3ed0d6db1
     */

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

function dtPicker(service) {
    var $ = jQuery;
    bootstrap();
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
                    var durationInHours = service.hourDifference(scope.internalRangeObject.from, scope.internalRangeObject.to);
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
