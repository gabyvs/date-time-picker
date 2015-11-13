import angular from 'angular';
import jQuery from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import RangeObserver from './rangeObserver';
import TimeResolution from './timeResolution';
import template from './dateTimePicker.html';

function dtPicker($timeout, service, bootstrapService) {
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
             * Initializes available ranges that user can select.
             */
            function setupRangeDictionary() {
                if (scope.rangeDictionary) { scope.dictionary = scope.rangeDictionary; }
                else { scope.dictionary = service.defaultDictionary; }
            }

            function setupCustomSettings() {
                if (scope.options && scope.options.hideCustom) {
                    _.remove(scope.dictionary, { custom: 'date' });
                }
                if (scope.options && scope.options.hideTimeUnit) {
                    scope.hideTimeUnit = true;
                }
                scope.maxRange = scope.options && scope.options.maxRange || 31;
            }

            /**
             * Sets main label initial state, and starts the range shared with main controller.
             */
            function setupDefaultRange() {
                scope.threeLetterTimezoneLabel = service.browserTimezone();
                const preselectedOption = _.find(scope.dictionary, { preselected: true }) || scope.dictionary[0];
                scope.isTimeRange = service.isTimeRange(preselectedOption);
                const obsTimeResolution = TimeResolution.timeResolutionFromLocal(preselectedOption);
                scope.internalRange = obsTimeResolution;
                scope.range = { from: obsTimeResolution.from, to: obsTimeResolution.to, timeUnit: obsTimeResolution.suggestedTimeUnit() };
                scope.observer.emit('dateTimePicker', obsTimeResolution);
            }

            scope.observer = new RangeObserver();
            scope.observer.subscribe('dateTimePicker', function (rangeObject) {
                scope.internalRange = rangeObject;
            });

            /**
             * Executes when a user clicks over the main label, causing the configure area to open.
             * It resets all controls to last saved range, and adjusted to current moment.
             */
            scope.configure = function () {
                scope.configuring = true; // TODO: this can be done in template
            };

            setupRangeDictionary();
            setupCustomSettings();
            $timeout(function () {
                setupDefaultRange();
            });

            //////////////////

            // TODO: this should emit and be catched by double calendar
            /**
             * After a user selects an option that represents a date range, e.g. 7 days, this function sets all date range controls accordingly.
             */
            function setupDateRange() {
                var from = scope.internalRangeObject.suggestedRange().from;
                scope.dateRange = {
                    from: new Date(from),
                    to: new Date(scope.internalRangeObject.suggestedRange().to)
                };
                setupAvailableTimeUnits(scope.internalRangeObject.suggestedRange().from, scope.internalRangeObject.suggestedRange().to);
            }

            // TODO: this function shouldnt be needed
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
                            scope.internalRangeObject = new TimeResolution(from.valueOf(), to.valueOf());
                            scope.internalRangeObject.selectedRange = _.find(scope.dictionary, { custom: 'date' });
                            scope.isTimeRange = false;
                        }
                    } else {
                        if (!scope.isTimeRange) {
                            // In this case, single calendar needs to be initialized with a default range
                            var from = new moment(scope.internalRangeObject.from).startOf('day');
                            var to = new moment(scope.internalRangeObject.from).startOf('day').add(1, 'day');
                            scope.internalRangeObject = new TimeResolution(from.valueOf(), to.valueOf());
                            scope.internalRangeObject.selectedRange = _.find(scope.dictionary, { custom: 'time' });
                            scope.isTimeRange = true;
                        }
                    }
                } else {
                    scope.internalRangeObject = TimeResolution.timeResolutionFromLocal(scope.internalRangeObject.selectedRange, honorTimeUnit ? scope.internalRangeObject.timeUnit : false);
                    scope.isTimeRange = service.isTimeRange(scope.internalRangeObject.selectedRange);
                }
                if (!honorTimeUnit) {
                    scope.internalRangeObject.timeUnit = scope.internalRangeObject.suggestedTimeUnit();
                }
            }

            // TODO: verify if this should be set when receiving a signal, particularly the time unit
            function setupInternalRange (from, to, rangeOption) {
                scope.internalRangeObject = new TimeResolution(from, to);
                scope.internalRangeObject.selectedRange = _.find(scope.dictionary, rangeOption);
                scope.internalRangeObject.timeUnit = scope.internalRangeObject.suggestedTimeUnit();
            }

            // TODO: this should happen when receiving a signal from double calendar
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
             * Only closes configuring space, without saving user changes.
             */
            scope.close = function () {
                scope.configuring = false;
            };

            // TODO: fix this
            /**
             * Takes last saved user selection to calculate ranges with current moment,
             * then it modifies controller range object with updated range.
             */
            scope.refresh = function () {
                scope.internalRangeObject.selectedRange = scope.savedRange;
                setInternalSelections(true);
                scope.save();
            };

            // TODO: fix this
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
        }
    }
}

export default dtPicker;
