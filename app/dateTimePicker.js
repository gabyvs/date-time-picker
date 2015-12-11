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
            setRange: '=',
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

            function buildRangeToSave () {
                scope.range = {
                    from: scope.internalRange.from,
                    to: scope.internalRange.to,
                    timeUnit: scope.internalRange.timeUnit
                };
                if (scope.internalRange.selectedRange.label !== 'Custom Range') {
                    scope.range.selection = { label: scope.internalRange.selectedRange.label };
                } else if (scope.mode !== 'absolute') {
                    scope.range.selection = { from: scope.selectedFrom, duration: scope.selectedDuration };
                }
                scope.savedRange = scope.internalRange.clone();
            }

            /**
             * Sets main label initial state, and starts the range shared with main controller.
             */
            function setupDefaultRange() {
                scope.threeLetterTimezoneLabel = service.browserTimezone();
                var timeResolution;
                // If it was initialized with a range, it will try to use it as a default setup
                if (scope.setRange && scope.setRange.label) {
                    const option = _.find(scope.dictionary, { label: scope.setRange.label }) || scope.dictionary[0];
                    timeResolution = TimeResolution.timeResolutionFromLocal(option);
                } else if (scope.setRange && scope.setRange.duration && scope.setRange.from) {
                    const toHelper = moment(scope.setRange.from).add(scope.setRange.duration.value, scope.setRange.duration.unit);
                    const helper = new TimeResolution(scope.setRange.from, toHelper.valueOf());
                    const suggestion = helper.suggestedRange();
                    timeResolution = new TimeResolution(suggestion.from, suggestion.to, helper.suggestedTimeUnit());
                } else if (scope.setRange && scope.setRange.duration) {
                    const option = _.find(scope.dictionary, { duration: scope.setRange.duration });
                    if (option) {
                        timeResolution = TimeResolution.timeResolutionFromLocal(option);
                    } else {
                        timeResolution = TimeResolution.timeResolutionFromLocal({ duration: scope.setRange.duration }, scope.setRange.duration.unit);
                        timeResolution.selectedRange = { label: 'Custom Range', custom: true };
                    }
                } else if (scope.setRange && scope.mode == 'absolute' && scope.setRange.from && scope.setRange.to) {
                    const from = moment(scope.setRange.from).seconds(0).milliseconds(0).valueOf();
                    const to = moment(scope.setRange.to).seconds(0).milliseconds(0).valueOf();
                    timeResolution = new TimeResolution(from, to);
                } else {
                    timeResolution = TimeResolution.timeResolutionFromLocal(scope.dictionary[0]);
                }
                scope.internalRange = timeResolution;
                scope.observer.emit('dateTimePicker', timeResolution);
                buildRangeToSave();
            }

            scope.observer = new RangeObserver();
            scope.observer.subscribe('dateTimePicker', function (rangeObject) {
                scope.internalRange = rangeObject;
            });

            setupRangeDictionary();
            setupCustomSettings();
            $timeout(function () {
                scope.$watch('setRange', () => {
                    setupDefaultRange();
                });

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
                buildRangeToSave();
                scope.configuring = false;
            };
        }
    }
}

export default dtPicker;
