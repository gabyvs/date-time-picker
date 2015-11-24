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
            absoluteMode: '='
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
                const preselectedOption = _.find(scope.dictionary, { preselected: true }) || scope.dictionary[0];
                const obsTimeResolution = TimeResolution.timeResolutionFromLocal(preselectedOption);
                scope.internalRange = obsTimeResolution;
                scope.range = { from: obsTimeResolution.from, to: obsTimeResolution.to, timeUnit: obsTimeResolution.suggestedTimeUnit() };
                scope.savedRange = obsTimeResolution.clone();
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
                scope.configuring = true;
            };

            /**
             * Only closes configuring space, without saving user changes.
             */
            scope.close = function () {
                scope.configuring = false;
            };

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
