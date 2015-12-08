import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';
import RangeObserver from './rangeObserver';
import TimeResolution from './timeResolution';
import template from './dateTimePicker.html';

function dtPicker($timeout, service, bootstrapService) {
    bootstrapService.bootstrap();
    return {
        restrict: 'E',
        replace: true,
        scope: {
            range: '=',
            options: '=',
            rangeDictionary: '=',
            mode: '='
        },
        template: template,
        link: function (scope) {
            /**
             * Initializes available ranges that user can select.
             */
            function setupRangeDictionary() {
                if (scope.rangeDictionary) { scope.dictionary = scope.rangeDictionary; }
                else { scope.dictionary = service.defaultDictionary; }
            }

            function setupCustomSettings() {
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
                var timeResolution;
                // If it was initialized with a range, it will try to use it as a default setup
                if (scope.range && scope.range.label) {
                    const option = _.find(scope.dictionary, { label: scope.range.label }) || scope.dictionary[0];
                    timeResolution = TimeResolution.timeResolutionFromLocal(option);
                } else if (scope.range && scope.range.duration && scope.range.from) {
                    timeResolution = new TimeResolution().changeFrom(scope.range.from).changeWithDuration(scope.range.duration);
                } else if (scope.range && scope.range.duration) {
                    const option = _.find(scope.dictionary, { duration: scope.range.duration });
                    if (option) {
                        timeResolution = TimeResolution.timeResolutionFromLocal(option);
                    } else {
                        timeResolution = TimeResolution.timeResolutionFromLocal({ duration: scope.range.duration }, scope.range.duration.unit);
                        timeResolution.selectedRange = { label: 'Custom Range', custom: true };
                    }
                } else if (scope.range && scope.mode == 'absolute' && scope.range.from && scope.range.to) {
                    const from = moment(scope.range.from).seconds(0).milliseconds(0).valueOf();
                    const to = moment(scope.range.to).seconds(0).milliseconds(0).valueOf();
                    timeResolution = new TimeResolution(from, to);
                } else {
                    timeResolution = TimeResolution.timeResolutionFromLocal(scope.dictionary[0]);
                }
                scope.internalRange = timeResolution;
                scope.range = { from: timeResolution.from, to: timeResolution.to, timeUnit: timeResolution.suggestedTimeUnit() };
                scope.savedRange = timeResolution.clone();
                scope.observer.emit('dateTimePicker', timeResolution);
            }

            scope.observer = new RangeObserver();
            scope.observer.subscribe('dateTimePicker', function (rangeObject) {
                scope.internalRange = rangeObject;
            });

            setupRangeDictionary();
            setupCustomSettings();
            $timeout(function () {
                setupDefaultRange();
            });

            /**
             * Takes last saved user selection to calculate ranges with current moment,
             * then it modifies controller range object with updated range.
             */
            scope.refresh = function () {
                scope.internalRange = scope.savedRange.refresh();
                scope.observer.emit('dateTimePicker', scope.internalRange);
                scope.save();
            };

            /**
             *  Saves user selections into controller range object, closing configuring area.
             */
            scope.save = function () {
                scope.range.from = scope.internalRange.from;
                scope.range.to = scope.internalRange.to;
                scope.range.timeUnit = scope.internalRange.timeUnit;
                scope.savedRange = scope.internalRange.clone();
                scope.configuring = false;
            };
        }
    }
}

export default dtPicker;
