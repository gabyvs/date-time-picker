import jQuery from 'jquery';
import datepick from 'imports?jQuery=jquery!../datepick/jquery.datepick.js';

function singleCalendar($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            observer: '='
        },
        template: '<div class="single-calendar-container"></div>',
        link: function (scope, element) {
            var internalSetting;

            /**
             * Executes when a range is selected and emitted by any of the other components
             * @param range
             */
            function onRangeSet(range) {
                internalSetting = true;
                // FIXME: Should this be done through a service so singleCalendar doesn't need to know specifics of range object?
                jQuery(element).datepick('setDate', new Date(range.suggestedRange().from));
            }

            $timeout(function () {
                scope.observer.subscribe('singleCalendar', onRangeSet);
            });

            scope.dateSelected = function (dates) {
                if (!dates || !dates.length) { return; }
                if (internalSetting) {
                    internalSetting = false;
                    return;
                }
                // TODO: here this component should emit!
//                scope.observer.emit({ dateSelected: dates[0]});
            };

            jQuery(element).datepick({
                minDate: '-6m',
                maxDate: +0,
                changeMonth: false,
                dayNamesMin : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                prevText: '<span class="datepickImagePrevious"></span><span class="datepickTextNextPrevious">Prev</span>',
                nextText: '<span class="datepickTextNextPrevious">Next</span><span class="datepickImageNext"></span>',
                onSelect: scope.dateSelected
            });
        }
    }
}

export default singleCalendar;
